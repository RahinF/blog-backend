# blog api

## Features
- CRUD operations on Posts and comments
- Nested comments system
- JWT auth with login persistance

## Routes

All routes are accessed from `api/v1/[route]`

#### Auth

`POST` auth/ - login into account

`POST` auth/register - create account with email and password

`GET` auth/refresh - create new accessToken if refreshToken is still valid

`POST` auth/logout - resets JWT and cookies



#### Post

`GET` posts/:postId - get a post

`GET` posts/ - get all posts

`POST` posts/ - create a post

`PUT` posts/ - update a post

`DELETE` posts/ - delete a post


#### Comment

`GET` comments/:postId - get all comments (including nested comments) with authors

`POST` comments/ - create a comment

`PUT` comments/ - update a comment

`DELETE` comments/ - delete a comment

#### User

`GET` users/ - get all users

`PUT` users/ - update a user


#### File upload

`POST` upload/ - upload a file

`DELETE` upload/ - delete a file