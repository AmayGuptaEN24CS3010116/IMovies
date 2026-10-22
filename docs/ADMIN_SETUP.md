# Admin Account Setup (Student Demo)

All public registrations receive role `user`. Do not add a public registration path that grants admin privileges.

1. Register your own test account on the live IMovies site.
2. Open MongoDB Atlas → your IMovies project → Data Explorer → `imovies` database → `users` collection.
3. Search for your account by email and open **Edit Document**.
4. Change only `role` from `user` to `admin`, save, then log out of IMovies and log back in.
5. The login response returns the stored role, and the frontend should show the Admin button.
6. Test with another ordinary account: the Admin button should be hidden and direct requests to `/api/admin/...` should return 403.

This direct database promotion is a one-off setup approach for a classroom demonstration. For a production system, create a privileged provisioning process with audit logging, multi-factor protection and limited operational access.
