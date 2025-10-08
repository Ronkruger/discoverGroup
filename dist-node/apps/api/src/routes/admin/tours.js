"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
let TOURS = [
    { id: "1", slug: "route-a-preferred", title: "Route A Preferred - European Adventure", durationDays: 14 }
];
router.get("/", (_req, res) => res.json(TOURS));
router.post("/", (req, res) => {
    const next = { id: String(TOURS.length + 1), ...req.body };
    TOURS.push(next);
    res.status(201).json(next);
});
router.get("/:id", (req, res) => {
    const found = TOURS.find((t) => t.id === req.params.id);
    if (!found)
        return res.status(404).json({ error: "not found" });
    res.json(found);
});
router.put("/:id", (req, res) => {
    const idx = TOURS.findIndex((t) => t.id === req.params.id);
    if (idx === -1)
        return res.status(404).json({ error: "not found" });
    TOURS[idx] = { ...TOURS[idx], ...req.body };
    res.json(TOURS[idx]);
});
router.delete("/:id", (req, res) => {
    TOURS = TOURS.filter((t) => t.id !== req.params.id);
    res.status(204).end();
});
exports.default = router;
