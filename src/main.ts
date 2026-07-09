import AccessMenu from "./AccessMenu/AccessMenu.js";
import { FileListView } from "./VideoTrim/FileListView.js";
import { TrimView } from "./VideoTrim/TrimView.js";

const fileList = new FileListView();
let trim: TrimView | null = null;
fileList.videoOpenEvent.connect(item => {
    if(trim) {
        trim.remove();
    }
    trim = new TrimView(item);
    fileList.setVisible(false);
}, { owners: null });

const accessMenu = new AccessMenu([]);