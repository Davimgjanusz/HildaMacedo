import "server-only";
import { db } from "./store";
// ---------------------------------------------------------------------------
// Usuários
// ---------------------------------------------------------------------------
export async function findUserByEmail(email) {
    return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}
export function insertUser(user) {
    db.users.push(user);
}
// ---------------------------------------------------------------------------
// Chamados de manutenção
// ---------------------------------------------------------------------------
export async function getTickets(filter = {}) {
    const list = filter.inquilinoId ? db.tickets.filter((t) => t.inquilinoId === filter.inquilinoId) : db.tickets;
    return structuredClone(list).sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
}
export function insertTicket(ticket) {
    db.tickets.unshift(ticket);
}
export function nextTicketId() {
    const max = db.tickets.reduce((acc, t) => Math.max(acc, Number(t.id.replace("ch-", ""))), 0);
    return `ch-${String(max + 1).padStart(4, "0")}`;
}
// ---------------------------------------------------------------------------
// Visitas e favoritos (área do cliente)
// ---------------------------------------------------------------------------
export async function getVisits(clienteId) {
    return structuredClone(db.visits.filter((v) => v.clienteId === clienteId)).sort((a, b) => `${b.data}${b.horario}`.localeCompare(`${a.data}${a.horario}`));
}
export function isSlotTaken(imovelId, data, horario) {
    return db.visits.some((v) => v.imovelId === imovelId && v.data === data && v.horario === horario && v.status === "agendada");
}
export function insertVisit(visit) {
    db.visits.push(visit);
}
export function cancelVisitById(id, clienteId) {
    const visit = db.visits.find((v) => v.id === id && v.clienteId === clienteId);
    if (!visit || visit.status !== "agendada")
        return false;
    visit.status = "cancelada";
    return true;
}
export async function getFavoriteIds(clienteId) {
    return db.favorites.filter((f) => f.clienteId === clienteId).map((f) => f.imovelId);
}
export function toggleFavoriteFor(clienteId, imovelId) {
    const index = db.favorites.findIndex((f) => f.clienteId === clienteId && f.imovelId === imovelId);
    if (index >= 0) {
        db.favorites.splice(index, 1);
        return false;
    }
    db.favorites.push({ clienteId, imovelId });
    return true;
}
// ---------------------------------------------------------------------------
// Chat interno
// ---------------------------------------------------------------------------
export async function getThreads() {
    return structuredClone(db.threads);
}
export function appendMessage(threadId, message) {
    const thread = db.threads.find((t) => t.id === threadId);
    if (!thread)
        return false;
    thread.mensagens.push(message);
    thread.naoLidas = 0;
    return true;
}
export function markThreadRead(threadId) {
    const thread = db.threads.find((t) => t.id === threadId);
    if (thread)
        thread.naoLidas = 0;
}
// ---------------------------------------------------------------------------
// Leads da landing page
// ---------------------------------------------------------------------------
export function insertLead(lead) {
    db.leads.unshift(lead);
}
export async function getLeads() {
    return structuredClone(db.leads);
}
