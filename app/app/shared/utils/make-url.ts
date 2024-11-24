export default function makeUrl(path: string, data: any) {
    // replace {x}
    let url = path;
    for (const key in data) {
        url = url.replaceAll(`{${key}}`, data[key]);
    }
    return url
}