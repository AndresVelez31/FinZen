# ACTIVITIES-172: The administrator's activities as a template for new users

## Status

Accepted

## Context

- Activities belong to a user (`Activity.userId`, `User 1 → 0..* Activity` in the class diagram)
  and `GET /activities` returns only the signed-in user's. Only the administrator could create
  them, so a user who signed up (AUTH-166) had none and could not record a transaction.
- Two other options were considered:
  - **One shared catalog** managed by the administrators: simple, but the budget of each activity
    (`targetAmount`) would be the same for everyone, which does not fit a personal finance app.
  - **Each user creates their own from scratch:** a new user would still start empty, and the
    administrator's activities page would lose its purpose.

## Decision

- **Template.** The activities of the users with the `admin` role are the template. On sign-up,
  `AuthService.signUp()` saves the user and a copy of every template activity (name, color, type
  and target amount) with `ActivitiesService.copyTemplateToUser()`, inside one
  `DataSource.transaction()`: either the user is created with their activities or not at all.
  `UsersService.create()` accepts the transaction's `EntityManager` for that.
- **Ownership.** The copies belong to the new user. `GET /activities` keeps filtering by `userId`;
  create, update and delete no longer require `@Roles(Role.Admin)`, so every user manages their
  own activities, and a transaction can only use activities of its owner.
- **Front-end.** `/activities`, `/activities/new` and `/activities/:id/edit` drop `meta.admin`, and
  "Actividades" appears in every user's menu; `/users` stays admin-only.
- **Existing users.** The `CopyActivityTemplate` migration gives the template to non-admin users
  without activities (those who signed up before this change). Its `down()` deletes only the copies
  still identical to a template activity and without transactions, so no user data is lost. The
  demo user keeps its own seven activities.

## Consequences

- Changes to the template reach only the users who sign up afterwards; existing users keep their
  copies (out of scope: syncing them).
- With several administrators the template is the activities of all of them; promoting a user to
  admin adds their activities to it.
