import { Map } from 'ol';
// export function setListeners(map: PluggableMap, options: Options) {
//     map.getViewport().addEventListener(options.eventType, )
// }
const internal = {
    init(map, options) {
        this.map = map;
        this.options = options;
        this.setListeners();
    },
    setListeners() {
        console.log('this.options', this.options, this);
        this.map
            .getViewport()
            .addEventListener(this.options.eventType, this.handleEvent.bind(this), false);
    },
    handleEvent(evt) {
        this.coordinate = this.map.getEventCoordinate(evt);
        this.pixel = this.map.getEventPixel(evt);
        console.log(this.coordinate, this.pixel);
    },
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    map: new Map(),
    options: {
        width: 0,
        scrollAt: 0,
        eventType: 'contextmenu',
        defaultItems: false,
    },
    coordinate: [],
    pixel: [],
};
export default internal;
//# sourceMappingURL=listeners.js.map