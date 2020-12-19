const monk = require("monk");
const chatbotDb = monk("mongodb://192.168.1.8:27017/chatbot-feli-page");
const users = chatbotDb.get("users");

class UserAPI {
    static async registerUser(userId, user) {
        if (!user) return;
        let match = await this.getUser(userId);
        if (match) return;
        const { name, email } = user;
        users.insert({
            userId,
            name,
            email,
        });
    }

    static async getUsers() {
        return await users.find({});
    }

    static async getUser(userId) {
        let matches = await users.find({ userId });
        if (matches.length > 0) {
            return matches[0];
        } else {
            return null;
        }
    }

    static async getUserName(userId) {
        let user = await this.getUser(userId);
        let name = user.name || undefined;
        return name;
    }

    static async setUserName(userId, name) {
        return await users.update({ userId }, { $set: { name } });
    }

    static async getUserPermissions(userId) {
        let user = await this.getUser(userId);
        let permissions = user.permissions || [];
        return permissions;
    }

    static async setUserPermissions(userId, permissions) {
        await users.update({ userId }, { $set: { permissions } });
    }

    static async addUserPermission(userId, permission) {
        let permissions = await this.getUserPermissions(userId);
        !permissions.includes(permission) && permissions.push(permission);
        await this.setUserPermissions(userId, permissions);
    }

    static async removeUserPermission(userId, permission) {
        let permissions = await this.getUserPermissions(userId);
        permissions = permissions.filter((perm) => perm != permission);
        await this.setUserPermissions(userId, permissions);
    }

    static async checkUserPermission(userId, permission) {
        let permissions = await this.getUserPermissions(userId);
        return permissions.includes(permission);
    }

    static async setUserLocation(userId, location) {
        const { latitude, longitude } = location;
        user.location = { latitude, longitude, time: new Date().getTime() };
        return await users.update(
            { userId },
            {
                $set: {
                    location: {
                        latitude,
                        longitude,
                        time: new Date().getTime(),
                    },
                },
            }
        );
    }

    static async getUserLocation(userId) {
        let user = await this.getUser(userId);
        let location = user.location;
        return location;
    }
}

async function test() {
    UserAPI.addUserPermission("85292747693@c.us", "YEELIGHT_CONTROL");
}

// test();

module.exports = { UserAPI };
