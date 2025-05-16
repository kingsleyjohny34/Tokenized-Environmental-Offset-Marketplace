;; Project Verification Contract
;; Validates environmental initiatives

(define-data-var admin principal tx-sender)

(define-map projects
  { project-id: uint }
  {
    owner: principal,
    name: (string-utf8 100),
    description: (string-utf8 500),
    location: (string-utf8 100),
    verified: bool,
    verifier: (optional principal)
  }
)

(define-data-var next-project-id uint u1)

;; Register a new environmental project
(define-public (register-project (name (string-utf8 100)) (description (string-utf8 500)) (location (string-utf8 100)))
  (let
    ((project-id (var-get next-project-id)))
    (begin
      (map-set projects
        { project-id: project-id }
        {
          owner: tx-sender,
          name: name,
          description: description,
          location: location,
          verified: false,
          verifier: none
        }
      )
      (var-set next-project-id (+ project-id u1))
      (ok project-id)
    )
  )
)

;; Verify a project (only authorized verifiers)
(define-public (verify-project (project-id uint))
  (let
    ((project (unwrap! (map-get? projects { project-id: project-id }) (err u1))))
    (begin
      (asserts! (or (is-eq tx-sender (var-get admin)) (is-some (get-verifier-status tx-sender))) (err u2))
      (map-set projects
        { project-id: project-id }
        (merge project { verified: true, verifier: (some tx-sender) })
      )
      (ok true)
    )
  )
)

;; Get project details
(define-read-only (get-project (project-id uint))
  (map-get? projects { project-id: project-id })
)

;; Verifier management
(define-map verifiers
  { address: principal }
  { authorized: bool }
)

(define-public (add-verifier (address principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u3))
    (ok (map-set verifiers { address: address } { authorized: true }))
  )
)

(define-public (remove-verifier (address principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u3))
    (ok (map-set verifiers { address: address } { authorized: false }))
  )
)

(define-read-only (get-verifier-status (address principal))
  (map-get? verifiers { address: address })
)

;; Set a new admin
(define-public (set-admin (new-admin principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u3))
    (ok (var-set admin new-admin))
  )
)
