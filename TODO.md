# TODO - Login/Register Updates

- [x] Update `frontend/src/pages/Login.jsx`:
  - [x] Add state for `regPasswordConfirmation`
  - [x] Change register email placeholder/text to Gmail-only
  - [x] Add second password confirmation input under password (keep existing styling)
  - [x] Implement client validation:
    - [x] Email matches `@gmail.com`
    - [x] Password matches confirmation
  - [x] Connect register submit to `POST /register` and send `password_confirmation`
  - [x] Handle success/failure without major UI layout changes
- [x] Test register flow in frontend

