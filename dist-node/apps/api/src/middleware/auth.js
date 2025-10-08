"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = requireAdmin;
function requireAdmin(_req, _res, next) {
    // Placeholder: implement JWT/SSO + RBAC verification here
    // For now allow all requests through on the scaffold branch
    next();
}
