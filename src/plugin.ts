import {
    HindenburgPlugin,
    WorkerPlugin,
    EventListener,
    PlayerSetNameEvent,
    Room,
    Worker,
    RoomBeforeCreateEvent,
    GameCode,
} from "@skeldjs/hindenburg";
import fs from "fs";
import path from "path";

export interface CustomCodeFromListPluginConfig {
    message: string;
}

@HindenburgPlugin("hbplugin-custom-code-from-list")
export class CustomCodeFromListPlugin extends WorkerPlugin {
    customCodes: number[];

    constructor(
        public readonly worker: Worker,
        public config: CustomCodeFromListPluginConfig
    ) {
        super(worker, config);
        this.customCodes = fs
            .readFileSync(path.join(__dirname, "../../codes.txt"))
            .toString()
            .split("\n")
            .filter((a) => !!a)
            .map((code) => GameCode.convertStringToInt(code.toUpperCase()));
    }

    findWord() {
        const customCodes = this.customCodes.filter(
            (code) => ![...this.worker.rooms.keys()].includes(code)
        );
        return customCodes[Math.floor(Math.random() * customCodes.length)];
    }

    @EventListener("room.beforecreate")
    onPlayerSetName(ev: RoomBeforeCreateEvent) {
        const word = this.findWord();
        if (word) ev.setCode(word);
    }
}
