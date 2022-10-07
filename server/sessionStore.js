/* abstract */ class SessionStore{
    findSession(id) {}
    saveSession(id, session) {}
    findAllSessions() {}
}

class InMemorySessionStore extends SessionStore {
    constructor() {
        super()
        this.sessions = new Map()
    }

    findSession(id) {
        console.log("returning session " + id, this.sessions.get(id))
        return this.sessions.get(id)
    }

    saveSession(id, session) {
        this.sessions.set(id, session)
        console.log("session saved " + JSON.stringify(session), id)
    }

    findAllSessions() {
        return [...this.sessions.values()]
    }
}

module.exports = {
    InMemorySessionStore
}