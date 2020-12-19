const YeeDevice = require("yeelight-platform").Device;

const deviceIPs = ["192.168.1.60", "192.168.1.61"];
const yeelightJob = {
    working: false,
    queue: [], // Queue of commands
    timeout: 1000,
    sleep: 1000,
};

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

class YeelightAPI {
    static start() {
        yeelightJob.loop = setInterval(async () => {
            // console.log(yeelightJob);
            if (yeelightJob.working) return;
            let job = yeelightJob.queue.shift();
            if (!job) return;
            yeelightJob.working = true;

            for (let deviceIP of deviceIPs) {
                let device = new YeeDevice({
                    host: deviceIP,
                    port: 55443,
                    debug: true,
                    interval: 5000,
                });

                device.connect();

                device.on("connected", async () => {
                    device.sendCommand(job);
                    device.disconnect();
                });

                device.on("disconnected", () => {});
            }
            await sleep(yeelightJob.sleep);
            yeelightJob.working = false;
        }, yeelightJob.timeout);
    }

    static stop() {
        if (yeelightJob.loop) clearInterval(yeelightJob.loop);
        return;
    }

    static async toggleLights(on) {
        let command = {
            id: -1,
        };
        if (on == undefined || on == null) {
            command.method = "toggle";
            command.params = ["toggle"];
        } else {
            command.method = "set_power";
            command.params = [on ? "on" : "off", "smooth", 200];
        }
        yeelightJob.queue.push(command);
        return deviceIPs.length;
    }
    static async turnAllLightsOn() {
        return await this.toggleLights(true);
    }
    static async turnAllLightsOff() {
        return await this.toggleLights(false);
    }
    static async flashLights(ms = 1000) {
        await YeelightAPI.toggleLights(null);
        return YeelightAPI.toggleLights(null);
        // setTimeout(() => {
        // }, 1000);
        // return await YeelightAPI.toggleLights();
    }
}

async function test() {
    await YeelightAPI.flashLights();
}

// test();

module.exports = { YeelightAPI };
