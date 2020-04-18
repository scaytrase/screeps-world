export default class ProtoCreep {
    public readonly body: BodyPartConstant[];
    public readonly memory: object;

    constructor(body: BodyPartConstant[], memory: object) {
        this.body = body;
        this.memory = memory;
    }
}