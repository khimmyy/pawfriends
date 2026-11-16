# PawFriends roadmap

What to work on next. Tick items by changing `- [ ]` to `- [x]` and commit the change with the work.
The **Todo Tree** panel in VS Code (the tree icon in the left sidebar) lists every open item here, plus any `TODO:` / `FIXME:` comments in the code.

Suggested order: the pull request, then the phone test, then the Profile real-data fixes.

## 1. Lock in what you have

- [ ] Open a pull request from `khim` into `main` (`main` is still at the first commit; everything since lives only on `khim`)
- [ ] Test on a real phone with Expo Go (so far everything was checked only in the browser)
  - [ ] Pick a pet photo and a post photo, then restart the app and check they are still there
  - [ ] Share a post (the phone's share sheet should open)
  - [ ] Switch dark and light, including "System" when the phone's setting changes
  - [ ] Keyboard behaviour on sign-in and in the comment box
- [ ] Update `README.md` (it still describes the Firebase migration; add pets, posts, themes, `npm test`, `npm run dev-db`, `npm run generate-theme`)

## 2. Replace the remaining sample data

- [ ] Profile: show the owner's real post count and photo grid; replace or remove the made-up "Friends" and "Likes" numbers
- [ ] PawFeed stories row: show your own pets, or remove it
- [ ] Adopt tab: a real list with a details screen; make search and the category chips work (`ADOPTABLE_PETS` in `data/pets.ts` is unused)
- [ ] Vet tab: vaccination and appointment records per pet, with reminders using `expo-notifications`
- [ ] Activity tab: build it from real events (likes and comments on your posts, vet reminders); replace the hardcoded "4" badge

## 3. Finish the features you have

- [ ] Delete a pet (remove its photo file too)
- [ ] Edit and delete your own posts and comments (the "…" menu on posts does nothing yet)
- [ ] Post photos on the web: copy the picked image so it survives a reload
- [ ] Account: change password and delete account ("Forgot password?" can only explain that local accounts can't be reset)

## 4. Code health

- [ ] Delete the template leftovers listed in `CLAUDE.md` (`themed-*`, `parallax-scroll-view`, `hello-wave`, `haptic-tab`, `external-link`, `FeedScreen.tsx`, `app/modal.tsx`) and unused packages such as `@react-navigation/*`
- [ ] Rename `pawfriends54` to `pawfriends` in `app.json` and `package.json` before anything is published (the URL scheme is hard to change later)
- [ ] Screen tests with React Native Testing Library (sign-in validation, creating a post, the like button)
- [ ] GitHub Action that runs lint, type check and tests on every pull request
- [x] Upgrade to Expo SDK 58 (React Native 0.88, React 19.3); keep `npx expo install --check` clean after patch releases
- [ ] Decide where Reusables components are used and pick one style for new forms (`components/ui/` vs `AuthField`)

## 5. Bigger next steps

- [ ] Online backend (for example Supabase) so people on different phones see each other's posts, with server-side password hashing
- [ ] Real build with EAS (`eas build`) to see the app icon and the light and dark launch screens, which Expo Go doesn't show
- [ ] Accessibility pass: screen reader labels, larger text sizes, touch targets
