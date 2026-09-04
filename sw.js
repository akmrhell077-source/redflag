self.addEventListener("push", function (event) {
    const data = event.data
        ? event.data.json()
        : {
            title: "RedFlag",
            body: "Tu as reçu une nouvelle réponse !"
        };

    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: "/redflag/icon.png",
            badge: "/redflag/icon.png"
        })
    );
});

self.addEventListener("notificationclick", function (event) {
    event.notification.close();

    event.waitUntil(
        clients.openWindow("/redflag/")
    );
});

