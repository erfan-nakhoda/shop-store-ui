# Frontend integration and remaining backend work

The frontend fixes and administration screens are implemented in this project. The backend was inspected through its running Swagger endpoint and read-only HTTP requests; its files were not changed.

## Verified existing responses

- `GET /product/all`: `{ status, message, data: { count, products: [...] } }`. The catalog and home page now read `products`; the catalog preserves `count`.
- `GET /product/get/2`: `{ status, message, data: { id: 2, name, total_count, categoryId, image: null, color } }`. Product cards link to `/products/2`.
- `GET /category/all`: `{ status, message, data: [...] }`.
- `GET /users/me`: 404. Administration intentionally stays closed when the server cannot verify the session and roles.

## Route collision requiring a backend fix

Swagger publishes both `GET /product/get/{id}` and `GET /product/get/{categoryId}`. These are the same route pattern; changing a parameter's name cannot select a different handler. The live request `/product/get/1` fails even though category 1 exists, while `/product/get/2` returns product 2.

The category screen now invokes `listByCategory(categoryId)`, with the requested `/product/get/:categoryId` default. It never silently falls back to all products or treats a single product as a category list. Recommended backend change: keep `/product/get/:id` for details and add `/product/category/:categoryId` for collections. Then set `VITE_PRODUCTS_BY_CATEGORY_ROUTE=/product/category/:categoryId` and restart Vite.

Category update/delete also publish conflicting slug/id patterns. The frontend uses the existing slug endpoints consistently. The backend should separate the ID variants if both are needed.

## Existing creation contracts

Product forms send `name`, `total_count` as a string, `color`, and `categoryId`. Optional fields are omitted when empty: `image` (URL), `color_hex` and `size`. The current Swagger describes `image` as binary inside JSON rather than an upload endpoint; the backend must clarify/implement nullable URL storage or a separate multipart upload contract. No file upload endpoint was assumed. Add optional `color_hex` and `size` fields to the DTO/entity before filling those fields. Existing products without these fields still render.

Category forms send `name`, `slug`, and optional parent `categoryId`. After successful mutations, the lists and category choices reload. Edit/delete use the original slug even when the slug is edited.

## Missing admin endpoint contract

These environment variables are intentionally empty. Their controls remain disabled until configured. The following paths are proposals, not existing endpoints:

| Variable | Suggested route | Method / body |
| --- | --- | --- |
| `VITE_ME_ROUTE` | `/users/me` | GET authenticated user `{ id, role }` or `{ id, roles: [] }`, optionally inside `data` |
| `VITE_PRODUCT_UPDATE_ROUTE` | `/product/update/:id` | PATCH product fields |
| `VITE_PRODUCT_DELETE_ROUTE` | `/product/delete/:id` | DELETE |
| `VITE_SUPPORT_LIST_ROUTE` | `/admin/support-users` | GET collection |
| `VITE_SUPPORT_CREATE_ROUTE` | `/admin/support-users` | POST `{ name, phone, role: "support", siteIds: ["1"], active: true }` |
| `VITE_SUPPORT_UPDATE_ROUTE` | `/admin/support-users/:id` | PATCH same editable fields; reassign sites, activate/deactivate |
| `VITE_SUPPORT_DELETE_ROUTE` | `/admin/support-users/:id` | DELETE |
| `VITE_SITES_LIST_ROUTE` | `/admin/sites` | GET sites `{ id, name, domain? }` |

Support collections may return an array, `{ items: [...] }`, or `{ users: [...] }`, optionally wrapped in `data`. Site collections use the same formats with `sites`. Support records should include `id`, `name`, `phone`, `siteIds` (array of IDs), and `active` (boolean). The interface creates support users and assigns existing sites; it does not create sites.

Place NestJS authentication and role guards on every management endpoint. Admins/superadmins may manage the catalog and support assignments; support users may only perform backend-authorized product actions for their assigned sites. The backend must derive identity from a verified session and enforce site boundaries, rather than trusting submitted roles/site IDs. `/admin` and `/support` also verify `/users/me` before mounting their screens. Local storage only affects navigation hints, never panel authorization.

## Validation

`npm.cmd test` exercises envelope parsing, counts, invalid category/detail responses, images, hex values and role matching. `npm.cmd run build` compiles the frontend. Creating/deleting real catalog records and support accounts was not attempted. Backend integration remains necessary before authenticated administration can be tested end to end.
