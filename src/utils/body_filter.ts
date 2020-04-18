export default class BodyFilter {
    public static byPartsCount(max: number, parts: BodyPartConstant[]): (body: BodyPartConstant[]) => boolean {
        return (body: BodyPartConstant[]) => body.filter(part => parts.includes(part)).length <= max;
    }
}