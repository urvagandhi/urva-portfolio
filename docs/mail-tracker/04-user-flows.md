# 04 — User Flows: Mail Tracker

| Field | Value |
|---|---|
| Document | 04-user-flows.md |
| Version | 1.1 (Mermaid Syntax Hardened) |
| Date | 15 Nov 2026 |
| Status | Approved. Formal sequence diagrams and interaction pathways. |
| Notation | Mermaid sequence diagrams with step-by-step state assertions. |

---

## 1. Flow F-01: Outreach Pre-Registration and Transmission Flow

This flow covers message creation in [`send_outreach.py`](file:///Users/urvagandhi/Documents/Resumes/Job_Automation/send_outreach.py), token pre-registration on the portfolio server, tailored PDF caching, email delivery and rollback handling if SMTP fails.

```mermaid
sequenceDiagram
    autonumber
    actor Owner as "Urva (Sender)"
    participant Script as "send_outreach.py"
    participant Tracker as "Tracker API"
    participant Redis as "Upstash Redis"
    participant SMTP as "Gmail SMTP"

    Owner->>Script: Run outreach with recipient, track, company and tailored resume
    Script->>Script: Generate RFC 822 Message-ID (make_msgid)
    opt Tailored Resume Detected
        Script->>Script: Read tailored PDF, compute SHA-256 and encode to Base64
    end

    Script->>Tracker: POST /api/mail/register with Bearer Secret, metadata, msg_id and pdf_base64
    Tracker->>Tracker: Verify secret, generate 16-byte random token and HMAC signature
    
    opt Tailored PDF Provided
        Tracker->>Redis: SET mail:pdf:sha256 Base64 EX 15552000 (180-day TTL)
    end
    
    Tracker->>Redis: HSET mail:m:token with metadata and status registered
    Tracker->>Redis: SADD mail:index:messages token
    Tracker-->>Script: 201 Created (token, pixel_url, doc_url, wrapped_urls)

    Script->>Script: Inject tracking URLs into HTML body and attach physical PDF file
    
    alt SMTP Send Succeeds
        Script->>SMTP: Connect via SSL, sendmail()
        SMTP-->>Script: 250 OK Message accepted
        Script->>Script: Output success, log to local sent history
    else SMTP Send Fails
        Script->>SMTP: Connection error or Timeout
        Script->>Tracker: POST /api/mail/void with Bearer Secret and token or msg_id
        Tracker->>Redis: HSET mail:m:token status voided
        Tracker-->>Script: 200 OK Record Voided
        Script->>Owner: Output transmission error and exclude record from metrics
    end
```

---

## 2. Flow F-02: Recruiter Email Open Flow

This flow details how the 1×1 GIF open beacon is processed, classified and persisted, applying the 5-minute debounce rule for Telegram alerts while maintaining fail-open execution.

```mermaid
sequenceDiagram
    autonumber
    actor Recruiter as "Recruiter Client"
    participant Proxy as "Proxy Layer"
    participant Pixel as "Pixel Route"
    participant Redis as "Upstash Redis"
    participant Telegram as "Telegram Bot API"

    Recruiter->>Proxy: GET /api/mail/pixel?t=token
    Proxy->>Pixel: Passthrough allowlisted route
    Pixel->>Pixel: Verify HMAC signature of token

    alt Token Invalid, Malformed, or Missing
        Pixel-->>Recruiter: 200 OK (42-byte GIF, no-cache headers)
    else Token Valid
        Pixel->>Redis: HGET mail:m:token (fetch recipient metadata and state)
        
        alt Message Voided or Not Found
            Pixel-->>Recruiter: 200 OK (42-byte GIF)
        else Message Active
            Pixel->>Pixel: Classify Client: Apple MPP, Gmail Proxy, or Direct Open
            Pixel->>Redis: HINCRBY mail:m:token opens 1
            Pixel->>Redis: HSET mail:m:token last_opened_at timestamp
            Pixel->>Redis: LPUSH mail:events:token event_json
            
            Pixel->>Redis: GET mail:debounce:open:token:client_class
            alt Debounce Key Exists (Within 5 Minutes)
                Pixel->>Redis: INCR mail:debounce:count:token:client_class
            else Debounce Key Absent
                Pixel->>Redis: SET mail:debounce:open:token:client_class 1 EX 300
                Pixel->>Telegram: POST /sendMessage (HTML format, IST time, metadata)
                Telegram-->>Pixel: 200 OK
            end
            
            Pixel-->>Recruiter: 200 OK (42-byte GIF89a, Cache-Control: no-store)
        end
    end
```

---

## 3. Flow F-03: Recruiter Link Click and Redirection Flow

This flow illustrates project and profile showcase click tracking. Link clicks are high-intent events and are **never debounced**.

```mermaid
sequenceDiagram
    autonumber
    actor Recruiter as "Recruiter"
    participant LnkRoute as "Link Redirect Route"
    participant Redis as "Upstash Redis"
    participant Telegram as "Telegram Bot API"
    participant Dest as "Destination Website"

    Recruiter->>LnkRoute: GET /api/mail/link with token and slug cointrack
    LnkRoute->>LnkRoute: Validate HMAC token and verify slug in Allowlist

    alt Unknown Slug or Empty
        LnkRoute-->>Recruiter: 404 Problem Details
    else Allowlisted Slug Valid
        LnkRoute->>Redis: HINCRBY mail:m:token clicks 1
        LnkRoute->>Redis: ZINCRBY mail:stats:slug_clicks 1 cointrack
        LnkRoute->>Redis: LPUSH mail:events:token event_json
      
        LnkRoute->>Telegram: POST /sendMessage (Immediate push alert for CoinTrack)
        Telegram-->>LnkRoute: 200 OK
      
        LnkRoute-->>Recruiter: 302 Found to CoinTrack showcase URL
        Recruiter->>Dest: Navigate to live showcase
    end
```

---

## 4. Flow F-04: Recruiter Resume Viewing Flow (Native Embed & Beacon)

This flow illustrates the web resume experience: serving the HTML container, streaming the PDF binary with frame-ancestor overrides, and recording visible dwell time and download events.

```mermaid
sequenceDiagram
    autonumber
    actor Recruiter as "Recruiter Browser"
    participant Doc as "Document Viewer"
    participant Pdf as "PDF Stream Route"
    participant Beacon as "Telemetry Beacon"
    participant Redis as "Upstash Redis"
    participant Telegram as "Telegram Bot API"

    Recruiter->>Doc: GET /api/mail/doc?t=token
    Doc->>Doc: Validate token
    Doc-->>Recruiter: 200 OK (HTML container with object embed and Fallback Link)

    Recruiter->>Pdf: GET /api/mail/pdf?t=token
    Pdf->>Redis: HGET mail:m:token pdf_key
    alt Tailored PDF Found in Redis
        Pdf->>Redis: GET mail:pdf:sha256
        Redis-->>Pdf: Base64 binary payload
        Pdf->>Pdf: Buffer.from(base64, 'base64')
    else Missing or Standard Track
        Pdf->>Pdf: Read public/resumes/Urva_Gandhi.pdf
    end
    Pdf-->>Recruiter: 200 application/pdf (X-Frame-Options: SAMEORIGIN)

    Doc->>Beacon: POST /api/mail/beacon (event: resume_view)
    Beacon->>Redis: HINCRBY mail:m:token resume_views 1
    Beacon->>Telegram: POST /sendMessage (Resume Viewed: Urva Gandhi)

    opt Dwell Time Measurement
        Recruiter->>Recruiter: Reads resume in active browser tab
        Note over Recruiter: visibilitychange / pagehide fires
        Recruiter->>Beacon: navigator.sendBeacon(/api/mail/beacon, dwell_ms: 45000)
        Beacon->>Redis: HINCRBY mail:m:token total_dwell_ms 45000
    end

    opt Download Button Clicked
        Recruiter->>Recruiter: Clicks custom Download PDF button in container
        Recruiter->>Beacon: navigator.sendBeacon(/api/mail/beacon, event: resume_download)
        Beacon->>Redis: HINCRBY mail:m:token downloads 1
        Beacon->>Telegram: POST /sendMessage (Resume Downloaded)
    end
```

---

## 5. Flow F-05: Gmail IMAP Status Synchronisation Flow

This flow details how `send_outreach.py` fetches outreach milestones and applies visual labels to Gmail Sent threads.

```mermaid
sequenceDiagram
    autonumber
    actor Owner as "Urva"
    participant Script as "send_outreach.py"
    participant API as "Status API Route"
    participant Redis as "Upstash Redis"
    participant IMAP as "Gmail IMAP"

    Owner->>Script: Run python send_outreach.py --sync-status
    Script->>API: GET /api/mail/status (Authorization: Bearer Secret)
    API->>Redis: Fetch registered messages with status != registered
    Redis-->>API: List of active thread states
    API-->>Script: 200 OK JSON status map

    Script->>IMAP: Connect SSL, login, select [Gmail]/Sent Mail
    loop For each message in status map
        Script->>IMAP: UID SEARCH HEADER Message-ID msg_id
        IMAP-->>Script: Return UID
        alt resume_views > 0
            Script->>IMAP: UID STORE uid +X-GM-LABELS with Viewed Resume label
        else opens > 0
            Script->>IMAP: UID STORE uid +X-GM-LABELS with Opened label
        end
    end
    Script->>Owner: Output summary of updated Gmail threads
```

---

## 6. Flow F-06: Private Analytics Dashboard Authentication Flow

This flow illustrates administrative access control for `/portal/outreach-telemetry`, enforcing 404 responses for public visitors.

### 6.1 Initial Route Access and Cookie Validation
```mermaid
sequenceDiagram
    autonumber
    actor Owner as "Urva (Browser)"
    participant Page as "Portal Page"
    participant Stats as "Stats API Route"
    participant Redis as "Upstash Redis"

    Owner->>Page: GET /portal/outreach-telemetry
    alt Valid outreach_admin_session Cookie Present
        Page->>Stats: GET /api/mail/stats (Cookie included)
        Stats->>Redis: Query pipeline counts, slug clicks, company rollups and feed
        Redis-->>Stats: Aggregated telemetry dataset
        Stats-->>Page: 200 OK JSON metrics
        Page-->>Owner: Render full responsive telemetry dashboard
    else No Session Cookie Present
        Page-->>Owner: Render Passkey Login Modal (404 facade for unauthenticated visitors)
    end
```

### 6.2 Passkey Verification and Session Issuance
```mermaid
sequenceDiagram
    autonumber
    actor Owner as "Urva (Browser)"
    participant Auth as "Auth API Route"
    participant Page as "Portal Page"

    Owner->>Auth: POST /api/mail/auth with passkey payload
    Auth->>Auth: timingSafeEqual(passkey, DASHBOARD_SECRET_KEY)
    alt Passkey Valid
        Auth-->>Owner: 200 OK (Set-Cookie: outreach_admin_session, HttpOnly, Secure, SameSite Strict)
        Owner->>Page: Reload /portal/outreach-telemetry (Loads authenticated dashboard)
    else Passkey Invalid
        Auth-->>Owner: 401 Unauthorized (Show invalid passkey alert)
    end
```
