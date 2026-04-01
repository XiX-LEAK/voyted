package api

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"vintrack-vinted/internal/session"
	"vintrack-vinted/internal/vinted"
)

type Server struct {
	sessions   *session.Manager
	listenAddr string
}

func NewServer(sessions *session.Manager, addr string) *Server {
	return &Server{sessions: sessions, listenAddr: addr}
}

func (s *Server) Start() error {
	mux := http.NewServeMux()

	mux.HandleFunc("POST /api/account/link", s.handleLink)
	mux.HandleFunc("DELETE /api/account/unlink", s.handleUnlink)
	mux.HandleFunc("GET /api/account/status", s.handleStatus)
	mux.HandleFunc("GET /api/account/info", s.handleInfo)

	mux.HandleFunc("POST /api/items/like", s.handleLike)
	mux.HandleFunc("POST /api/items/unlike", s.handleUnlike)
	mux.HandleFunc("GET /api/items/liked", s.handleLikedItems)
	mux.HandleFunc("GET /api/items/favorites", s.handleFavorites)

	mux.HandleFunc("GET /api/items/my-items", s.handleMyItems)
	mux.HandleFunc("POST /api/items/relist/{id}", s.handleRelistItem)
	mux.HandleFunc("POST /api/items/repost/{id}", s.handleRepostItem)
	mux.HandleFunc("PATCH /api/items/update/{id}", s.handleUpdateItemPrice)

	mux.HandleFunc("POST /api/items/like-all", s.handleLikeAll)

	mux.HandleFunc("GET /api/orders/sold", s.handleMySoldOrders)

	mux.HandleFunc("GET /api/messages/inbox", s.handleInbox)
	mux.HandleFunc("GET /api/notifications", s.handleNotifications)
	mux.HandleFunc("GET /api/messages/conversations/{id}", s.handleConversationReplies)
	mux.HandleFunc("POST /api/messages/send", s.handleSendMessage)
	mux.HandleFunc("POST /api/messages/reply", s.handleReplyToConversation)
	mux.HandleFunc("POST /api/offers/send", s.handleSendOffer)

	mux.HandleFunc("POST /api/account/refresh", s.handleRefreshToken)
	mux.HandleFunc("GET /api/account/analyze", s.handleAnalyzeAccount)

	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, 200, map[string]string{"status": "ok"})
	})

	log.Printf("API server listening on %s", s.listenAddr)
	return http.ListenAndServe(s.listenAddr, s.withMiddleware(mux))
}

func (s *Server) withMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, DELETE, PATCH, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, X-User-ID")
		if r.Method == "OPTIONS" {
			w.WriteHeader(204)
			return
		}
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s %s", r.Method, r.URL.Path, time.Since(start).Round(time.Millisecond))
	})
}

func getUserID(r *http.Request) string {
	return r.Header.Get("X-User-ID")
}

func writeJSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, msg string, status int) {
	writeJSON(w, status, map[string]string{"error": msg})
}

func (s *Server) getSessionAndClient(r *http.Request, w http.ResponseWriter) (*session.VintedSession, *vinted.Client, bool) {
	userID := getUserID(r)
	if userID == "" {
		writeError(w, "unauthorized: missing X-User-ID header", 401)
		return nil, nil, false
	}

	sess, err := s.sessions.Get(userID)
	if err != nil {
		writeError(w, "session fetch error", 500)
		return nil, nil, false
	}
	if sess == nil {
		writeError(w, "no linked Vinted account", 404)
		return nil, nil, false
	}

	client, err := vinted.NewClient(sess)
	if err != nil {
		writeError(w, "failed to create Vinted client", 500)
		return nil, nil, false
	}

	if err := client.WarmUp(); err != nil {
		log.Printf("[session] warmup failed for user %s: %v", userID, err)
	}

	if sess.Status != "active" {
		log.Printf("[session] session for user %s is %s, attempting recovery...", userID, sess.Status)

		if sess.RefreshToken != "" {
			log.Printf("[session] attempting token refresh for user %s...", userID)
			if err := client.RefreshAccessToken(); err != nil {
				log.Printf("[session] token refresh failed for user %s: %v", userID, err)
			} else {
				log.Printf("[session] token refresh succeeded for user %s", userID)
				updated := client.GetSession()
				updated.Status = "active"
				updated.LastCheck = time.Now().UTC().Format(time.RFC3339)
				_ = s.sessions.Store(*updated)
				sess = updated
				return sess, client, true
			}
		}

		if client.ValidateSession() {
			log.Printf("[session] re-validation succeeded for user %s, reactivating session", userID)
			sess.Status = "active"
			sess.LastCheck = time.Now().UTC().Format(time.RFC3339)
			_ = s.sessions.Store(*sess)
		} else {
			writeError(w, "Vinted session is "+sess.Status+", please re-link", 403)
			return nil, nil, false
		}
	}

	return sess, client, true
}

type linkRequest struct {
	AccessToken    string `json:"access_token"`
	RefreshToken   string `json:"refresh_token"`
	DatadomeCookie string `json:"datadome_cookie"`
	Domain         string `json:"domain"`
}

func (s *Server) handleLink(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		writeError(w, "unauthorized", 401)
		return
	}

	var req linkRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", 400)
		return
	}

	if req.AccessToken == "" {
		writeError(w, "access_token is required", 400)
		return
	}
	if req.Domain == "" {
		writeError(w, "domain is required", 400)
		return
	}

	sess := session.VintedSession{
		UserID:         userID,
		AccessToken:    req.AccessToken,
		RefreshToken:   req.RefreshToken,
		DatadomeCookie: req.DatadomeCookie,
		Domain:         req.Domain,
		Status:         "active",
		LinkedAt:       time.Now().UTC().Format(time.RFC3339),
		LastCheck:      time.Now().UTC().Format(time.RFC3339),
	}

	client, err := vinted.NewClient(&sess)
	if err != nil {
		writeError(w, "failed to create client: "+err.Error(), 500)
		return
	}

	if err := client.WarmUp(); err != nil {
		log.Printf("[link] warmup warning for user %s: %v", userID, err)
	}

	info, err := client.GetAccountInfo()
	if err != nil {
		writeError(w, "invalid token: "+err.Error(), 401)
		return
	}

	sess.VintedUserID = info.ID
	sess.VintedName = info.Login

	if err := s.sessions.Store(sess); err != nil {
		writeError(w, "failed to save session", 500)
		return
	}

	log.Printf("[account] linked user %s -> @%s (ID: %d) on %s", userID, info.Login, info.ID, req.Domain)

	writeJSON(w, 200, map[string]interface{}{
		"linked":      true,
		"vinted_name": info.Login,
		"vinted_id":   info.ID,
		"domain":      req.Domain,
	})
}

func (s *Server) handleUnlink(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		writeError(w, "unauthorized", 401)
		return
	}

	if err := s.sessions.Delete(userID); err != nil {
		writeError(w, "failed to unlink", 500)
		return
	}
	_ = s.sessions.DeleteLikes(userID)

	log.Printf("[account] unlinked user %s", userID)
	writeJSON(w, 200, map[string]string{"status": "unlinked"})
}

func (s *Server) handleStatus(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		writeError(w, "unauthorized", 401)
		return
	}

	sess, err := s.sessions.Get(userID)
	if err != nil {
		writeError(w, "error fetching session", 500)
		return
	}

	if sess == nil {
		writeJSON(w, 200, map[string]interface{}{"linked": false})
		return
	}

	writeJSON(w, 200, map[string]interface{}{
		"linked":      true,
		"status":      sess.Status,
		"vinted_name": sess.VintedName,
		"vinted_id":   sess.VintedUserID,
		"domain":      sess.Domain,
		"linked_at":   sess.LinkedAt,
		"last_check":  sess.LastCheck,
	})
}

func (s *Server) handleInfo(w http.ResponseWriter, r *http.Request) {
	_, client, ok := s.getSessionAndClient(r, w)
	if !ok {
		return
	}

	info, err := client.GetAccountInfo()
	if err != nil {
		writeError(w, "failed to fetch account: "+err.Error(), 502)
		return
	}

	writeJSON(w, 200, info)
}

type itemRequest struct {
	ItemID int64 `json:"item_id"`
}

func (s *Server) handleLike(w http.ResponseWriter, r *http.Request) {
	sess, client, ok := s.getSessionAndClient(r, w)
	if !ok {
		return
	}

	var req itemRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.ItemID == 0 {
		writeError(w, "item_id is required", 400)
		return
	}

	if err := client.LikeItem(req.ItemID); err != nil {
		writeError(w, "like failed: "+err.Error(), 502)
		return
	}

	s.persistIfRefreshed(sess, client)

	userID := getUserID(r)
	_ = s.sessions.AddLike(userID, req.ItemID)

	writeJSON(w, 200, map[string]interface{}{"status": "liked", "item_id": req.ItemID})
}

func (s *Server) handleUnlike(w http.ResponseWriter, r *http.Request) {
	sess, client, ok := s.getSessionAndClient(r, w)
	if !ok {
		return
	}

	var req itemRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.ItemID == 0 {
		writeError(w, "item_id is required", 400)
		return
	}

	if err := client.UnlikeItem(req.ItemID); err != nil {
		writeError(w, "unlike failed: "+err.Error(), 502)
		return
	}

	s.persistIfRefreshed(sess, client)

	userID := getUserID(r)
	_ = s.sessions.RemoveLike(userID, req.ItemID)

	writeJSON(w, 200, map[string]interface{}{"status": "unliked", "item_id": req.ItemID})
}

func (s *Server) handleLikedItems(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		writeError(w, "unauthorized", 401)
		return
	}

	ids, err := s.sessions.GetLikes(userID)
	if err != nil {
		writeError(w, "failed to fetch likes", 500)
		return
	}

	writeJSON(w, 200, map[string]interface{}{"item_ids": ids})
}

func (s *Server) handleFavorites(w http.ResponseWriter, r *http.Request) {
	sess, client, ok := s.getSessionAndClient(r, w)
	if !ok {
		return
	}

	page := r.URL.Query().Get("page")
	favs, err := client.GetFavourites(sess.VintedUserID, page)
	if err != nil {
		writeError(w, "failed to fetch favorites: "+err.Error(), 502)
		return
	}

	client.EnrichFavorites(favs)

	s.persistIfRefreshed(sess, client)
	writeJSON(w, 200, favs)
}

func (s *Server) handleInbox(w http.ResponseWriter, r *http.Request) {
	sess, client, ok := s.getSessionAndClient(r, w)
	if !ok {
		return
	}

	page := 1
	if raw := strings.TrimSpace(r.URL.Query().Get("page")); raw != "" {
		if parsed, err := strconv.Atoi(raw); err == nil && parsed > 0 {
			page = parsed
		}
	}

	perPage := 20
	if raw := strings.TrimSpace(r.URL.Query().Get("per_page")); raw != "" {
		if parsed, err := strconv.Atoi(raw); err == nil && parsed > 0 && parsed <= 100 {
			perPage = parsed
		}
	}

	inbox, err := client.GetInbox(page, perPage)
	if err != nil {
		writeError(w, "failed to fetch inbox: "+err.Error(), 502)
		return
	}

	s.persistIfRefreshed(sess, client)
	writeJSON(w, 200, inbox)
}

func (s *Server) handleNotifications(w http.ResponseWriter, r *http.Request) {
	sess, client, ok := s.getSessionAndClient(r, w)
	if !ok {
		return
	}

	page := 1
	if raw := strings.TrimSpace(r.URL.Query().Get("page")); raw != "" {
		if parsed, err := strconv.Atoi(raw); err == nil && parsed > 0 {
			page = parsed
		}
	}

	perPage := 5
	if raw := strings.TrimSpace(r.URL.Query().Get("per_page")); raw != "" {
		if parsed, err := strconv.Atoi(raw); err == nil && parsed > 0 && parsed <= 50 {
			perPage = parsed
		}
	}

	notifications, err := client.GetNotifications(page, perPage)
	if err != nil {
		writeError(w, "failed to fetch notifications: "+err.Error(), 502)
		return
	}

	s.persistIfRefreshed(sess, client)
	writeJSON(w, 200, notifications)
}

func (s *Server) handleConversationReplies(w http.ResponseWriter, r *http.Request) {
	sess, client, ok := s.getSessionAndClient(r, w)
	if !ok {
		return
	}

	conversationID, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil || conversationID == 0 {
		writeError(w, "invalid conversation id", 400)
		return
	}

	page := 1
	if raw := strings.TrimSpace(r.URL.Query().Get("page")); raw != "" {
		if parsed, err := strconv.Atoi(raw); err == nil && parsed > 0 {
			page = parsed
		}
	}

	perPage := 100
	if raw := strings.TrimSpace(r.URL.Query().Get("per_page")); raw != "" {
		if parsed, err := strconv.Atoi(raw); err == nil && parsed > 0 && parsed <= 200 {
			perPage = parsed
		}
	}

	payload, err := client.GetConversationReplies(conversationID, page, perPage)
	if err != nil {
		writeError(w, "failed to fetch conversation replies: "+err.Error(), 502)
		return
	}

	payload["current_user_id"] = sess.VintedUserID

	s.persistIfRefreshed(sess, client)
	writeJSON(w, 200, payload)
}

func (s *Server) persistIfRefreshed(original *session.VintedSession, client *vinted.Client) {
	updated := client.GetSession()
	if updated.AccessToken != original.AccessToken {
		updated.Status = "active"
		updated.LastCheck = time.Now().UTC().Format(time.RFC3339)
		if err := s.sessions.Store(*updated); err != nil {
			log.Printf("[server] failed to persist refreshed session for user %s: %v", updated.UserID, err)
		} else {
			log.Printf("[server] persisted refreshed tokens for user %s", updated.UserID)
		}
	}
}

type sendMessageRequest struct {
	ItemID   int64  `json:"item_id"`
	SellerID int64  `json:"seller_id"`
	Message  string `json:"message"`
}

type replyToConversationRequest struct {
	ConversationID int64  `json:"conversation_id"`
	Message        string `json:"message"`
}

func (s *Server) handleSendMessage(w http.ResponseWriter, r *http.Request) {
	sess, client, ok := s.getSessionAndClient(r, w)
	if !ok {
		return
	}

	var req sendMessageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", 400)
		return
	}

	if req.ItemID == 0 {
		writeError(w, "item_id is required", 400)
		return
	}
	if req.SellerID == 0 {
		writeError(w, "seller_id is required", 400)
		return
	}
	msg := strings.TrimSpace(req.Message)
	if msg == "" {
		writeError(w, "message is required", 400)
		return
	}
	if len(msg) > 2000 {
		writeError(w, "message too long (max 2000 characters)", 400)
		return
	}

	if err := client.SendMessage(req.ItemID, req.SellerID, msg); err != nil {
		writeError(w, "send message failed: "+err.Error(), 502)
		return
	}

	s.persistIfRefreshed(sess, client)

	writeJSON(w, 200, map[string]interface{}{"status": "sent", "item_id": req.ItemID})
}

func (s *Server) handleReplyToConversation(w http.ResponseWriter, r *http.Request) {
	sess, client, ok := s.getSessionAndClient(r, w)
	if !ok {
		return
	}

	var req replyToConversationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", 400)
		return
	}

	if req.ConversationID == 0 {
		writeError(w, "conversation_id is required", 400)
		return
	}

	msg := strings.TrimSpace(req.Message)
	if msg == "" {
		writeError(w, "message is required", 400)
		return
	}
	if len(msg) > 2000 {
		writeError(w, "message too long (max 2000 characters)", 400)
		return
	}

	if err := client.ReplyToConversation(req.ConversationID, msg); err != nil {
		writeError(w, "send reply failed: "+err.Error(), 502)
		return
	}

	s.persistIfRefreshed(sess, client)

	writeJSON(w, 200, map[string]interface{}{"status": "sent", "conversation_id": req.ConversationID})
}

type sendOfferRequest struct {
	ItemID   int64  `json:"item_id"`
	SellerID int64  `json:"seller_id"`
	Price    string `json:"price"`
	Currency string `json:"currency"`
}

func (s *Server) handleSendOffer(w http.ResponseWriter, r *http.Request) {
	sess, client, ok := s.getSessionAndClient(r, w)
	if !ok {
		return
	}

	var req sendOfferRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", 400)
		return
	}

	if req.ItemID == 0 {
		writeError(w, "item_id is required", 400)
		return
	}
	if req.SellerID == 0 {
		writeError(w, "seller_id is required", 400)
		return
	}
	if req.Price == "" {
		writeError(w, "price is required", 400)
		return
	}
	if req.Currency == "" {
		req.Currency = "EUR" // default
	}

	if err := client.SendOffer(req.ItemID, req.SellerID, req.Price, req.Currency); err != nil {
		writeError(w, err.Error(), 502)
		return
	}

	s.persistIfRefreshed(sess, client)

	writeJSON(w, 200, map[string]interface{}{"status": "sent", "item_id": req.ItemID, "price": req.Price})
}

func (s *Server) handleRefreshToken(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		writeError(w, "unauthorized", 401)
		return
	}

	sess, err := s.sessions.Get(userID)
	if err != nil {
		writeError(w, "session fetch error", 500)
		return
	}
	if sess == nil {
		writeError(w, "no linked Vinted account", 404)
		return
	}
	if sess.RefreshToken == "" {
		writeError(w, "no refresh token available — please re-link with a refresh token", 400)
		return
	}

	client, err := vinted.NewClient(sess)
	if err != nil {
		writeError(w, "failed to create client", 500)
		return
	}

	if err := client.WarmUp(); err != nil {
		log.Printf("[refresh] warmup warning for user %s: %v", userID, err)
	}

	if err := client.RefreshAccessToken(); err != nil {
		log.Printf("[refresh] token refresh failed for user %s: %v", userID, err)

		var body struct {
			RefreshToken string `json:"refresh_token"`
		}
		_ = json.NewDecoder(strings.NewReader("")).Decode(&body)

		writeError(w, "token refresh failed: "+err.Error(), 502)
		return
	}

	updated := client.GetSession()
	updated.Status = "active"
	updated.LastCheck = time.Now().UTC().Format(time.RFC3339)
	if err := s.sessions.Store(*updated); err != nil {
		writeError(w, "failed to save refreshed session", 500)
		return
	}

	log.Printf("[refresh] token refreshed for user %s (@%s)", userID, updated.VintedName)

	writeJSON(w, 200, map[string]interface{}{
		"status":      "refreshed",
		"vinted_name": updated.VintedName,
		"vinted_id":   updated.VintedUserID,
		"domain":      updated.Domain,
	})
}

func (s *Server) handleMyItems(w http.ResponseWriter, r *http.Request) {
	sess, client, ok := s.getSessionAndClient(r, w)
	if !ok {
		return
	}

	page := r.URL.Query().Get("page")
	if page == "" {
		page = "1"
	}

	data, statusCode, err := client.GetMyItems(sess.VintedUserID, page)
	if err != nil {
		writeError(w, "failed to fetch items: "+err.Error(), 502)
		return
	}

	s.persistIfRefreshed(sess, client)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	w.Write(data)
}

func (s *Server) handleRelistItem(w http.ResponseWriter, r *http.Request) {
	sess, client, ok := s.getSessionAndClient(r, w)
	if !ok {
		return
	}

	itemID, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil || itemID == 0 {
		writeError(w, "invalid item id", 400)
		return
	}

	newID, err := client.RelistItem(itemID)
	if err != nil {
		writeError(w, "relist failed: "+err.Error(), 502)
		return
	}

	s.persistIfRefreshed(sess, client)

	log.Printf("[relist] item %d -> %d for user %s", itemID, newID, getUserID(r))
	writeJSON(w, 200, map[string]interface{}{
		"status":      "relisted",
		"old_item_id": itemID,
		"new_item_id": newID,
	})
}

type repostRequest struct {
	ItemID      int64 `json:"item_id"`
	Orientation int   `json:"orientation"`
	AsDraft     bool  `json:"as_draft"`
}

func (s *Server) handleRepostItem(w http.ResponseWriter, r *http.Request) {
	sess, client, ok := s.getSessionAndClient(r, w)
	if !ok {
		return
	}

	itemID, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil || itemID == 0 {
		writeError(w, "invalid item id", 400)
		return
	}

	var req repostRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		// Defaults: orientation=0, as_draft=true
	}

	orientation := req.Orientation
	if orientation < 0 || orientation > 3 {
		orientation = 0
	}

	newID, err := client.RepostItem(itemID, orientation, req.AsDraft)
	if err != nil {
		writeError(w, "repost failed: "+err.Error(), 502)
		return
	}

	s.persistIfRefreshed(sess, client)

	log.Printf("[repost] item %d -> %d (draft=%v, orientation=%d) for user %s", itemID, newID, req.AsDraft, orientation, getUserID(r))
	writeJSON(w, 200, map[string]interface{}{
		"status":      "reposted",
		"old_item_id": itemID,
		"new_item_id": newID,
		"as_draft":    req.AsDraft,
	})
}

type updatePriceRequest struct {
	Price    string `json:"price"`
	Currency string `json:"currency"`
}

func (s *Server) handleUpdateItemPrice(w http.ResponseWriter, r *http.Request) {
	sess, client, ok := s.getSessionAndClient(r, w)
	if !ok {
		return
	}

	itemID, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil || itemID == 0 {
		writeError(w, "invalid item id", 400)
		return
	}

	var req updatePriceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", 400)
		return
	}
	if req.Price == "" {
		writeError(w, "price is required", 400)
		return
	}
	if req.Currency == "" {
		req.Currency = "EUR"
	}

	if err := client.UpdateItemPrice(itemID, req.Price, req.Currency); err != nil {
		writeError(w, "failed to update price: "+err.Error(), 502)
		return
	}

	s.persistIfRefreshed(sess, client)

	log.Printf("[update-price] item %d -> %s %s for user %s", itemID, req.Price, req.Currency, getUserID(r))
	writeJSON(w, 200, map[string]interface{}{
		"status":  "updated",
		"item_id": itemID,
		"price":   req.Price,
	})
}

func (s *Server) handleMySoldOrders(w http.ResponseWriter, r *http.Request) {
	sess, client, ok := s.getSessionAndClient(r, w)
	if !ok {
		return
	}

	page := r.URL.Query().Get("page")
	if page == "" {
		page = "1"
	}

	data, statusCode, err := client.GetMySoldOrders(page)
	if err != nil {
		writeError(w, "failed to fetch orders: "+err.Error(), 502)
		return
	}

	s.persistIfRefreshed(sess, client)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	w.Write(data)
}

func (s *Server) handleAnalyzeAccount(w http.ResponseWriter, r *http.Request) {
	_, client, ok := s.getSessionAndClient(r, w)
	if !ok {
		return
	}

	userIDStr := r.URL.Query().Get("user_id")
	if userIDStr == "" {
		writeError(w, "user_id query parameter is required", 400)
		return
	}

	userID, err := strconv.ParseInt(userIDStr, 10, 64)
	if err != nil || userID <= 0 {
		writeError(w, "invalid user_id", 400)
		return
	}

	// Fetch user profile
	userInfo, err := client.GetUserProfile(userID)
	if err != nil {
		writeError(w, "failed to fetch user profile: "+err.Error(), 502)
		return
	}

	// Fetch user items (wardrobe) — get RAW data for deep analysis
	itemsData, _, err := client.GetMyItems(userID, "1")
	if err != nil {
		log.Printf("[analyze] failed to fetch items for user %d: %v", userID, err)
		writeJSON(w, 200, map[string]interface{}{
			"user":        userInfo,
			"items":       []interface{}{},
			"items_count": 0,
		})
		return
	}

	// Pass raw items JSON to client for deep analysis
	var rawItems map[string]interface{}
	if err := json.Unmarshal(itemsData, &rawItems); err != nil {
		rawItems = map[string]interface{}{"items": []interface{}{}}
	}

	items, _ := rawItems["items"].([]interface{})
	if items == nil {
		items = []interface{}{}
	}

	// Also try to fetch user feedback
	var feedback interface{}
	feedbackData, statusCode, feedbackErr := client.GetUserFeedback(userID)
	if feedbackErr == nil && statusCode == 200 {
		var fb interface{}
		if json.Unmarshal(feedbackData, &fb) == nil {
			feedback = fb
		}
	}

	writeJSON(w, 200, map[string]interface{}{
		"user":        userInfo,
		"items":       items,
		"items_count": len(items),
		"feedback":    feedback,
	})
}

type likeAllRequest struct {
	UserID int64 `json:"user_id"`
}

func (s *Server) handleLikeAll(w http.ResponseWriter, r *http.Request) {
	sess, client, ok := s.getSessionAndClient(r, w)
	if !ok {
		return
	}

	var req likeAllRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.UserID == 0 {
		writeError(w, "user_id is required", 400)
		return
	}

	// Fetch user's wardrobe items
	itemsData, _, err := client.GetMyItems(req.UserID, "1")
	if err != nil {
		writeError(w, "failed to fetch wardrobe: "+err.Error(), 502)
		return
	}

	var itemsResp struct {
		Items []struct {
			ID int64 `json:"id"`
		} `json:"items"`
	}
	if err := json.Unmarshal(itemsData, &itemsResp); err != nil {
		writeError(w, "failed to parse wardrobe items", 500)
		return
	}

	liked := 0
	failed := 0
	callerID := getUserID(r)

	for _, item := range itemsResp.Items {
		if err := client.LikeItem(item.ID); err != nil {
			log.Printf("[like-all] failed to like item %d: %v", item.ID, err)
			failed++
		} else {
			liked++
			_ = s.sessions.AddLike(callerID, item.ID)
		}
		time.Sleep(500 * time.Millisecond)
	}

	s.persistIfRefreshed(sess, client)

	log.Printf("[like-all] user %s liked %d/%d items from wardrobe %d", callerID, liked, len(itemsResp.Items), req.UserID)
	writeJSON(w, 200, map[string]interface{}{
		"status": "done",
		"liked":  liked,
		"failed": failed,
		"total":  len(itemsResp.Items),
	})
}
