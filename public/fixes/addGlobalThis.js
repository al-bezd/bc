
if (typeof AbortController === 'undefined') {
    window.globalThis = window
    class AbortController {
        //public signal:any
        constructor() {
            this.signal = null;
        }

        abort() {
            if (this.signal && typeof this.signal.onabort === 'function') {
                this.signal.onabort();
            }
        }
    }

    window.AbortController = AbortController;
}