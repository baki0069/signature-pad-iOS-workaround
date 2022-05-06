import { Controller } from "@hotwired/stimulus"
import SignaturePad from "signature_pad"

let signaturePad, wrapper, canvas, form, input

export default class extends Controller {

    connect() {

        wrapper = this.element
        canvas = wrapper.querySelector("canvas")
        form = wrapper.closest("form")
        input = wrapper.querySelector("input[type='hidden']")

        signaturePad = new SignaturePad(canvas)

        let ratio = Math.max(window.devicePixelRatio || 1, 1)

        canvas.width = canvas.offsetWidth * ratio
        canvas.height = canvas.offsetHeight * ratio
        canvas.getContext("2d").scale(ratio, ratio)

        // "Sorts out" issue with poor canvas performance on some iOS devices
        let ver = this.checkiOSversion()

        if (typeof ver === 'undefined' || ver[0] < 13) {
            window.addEventListener("resize", this.resizeCanvas)
        }
        else {
            Screen.lockOrientation('portrait')
        }

        form.onsubmit = this.onSubmit

    }

    checkiOSversion() {
        if (/iP(hone|od|ad)/.test(navigator.platform)) {
            var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
            return [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
        }
    }

    onSubmit() {
        if (signaturePad.isEmpty() === false)
            input.value = signaturePad.toDataURL()
    }
    
    resizeCanvas() {

        let image = signaturePad.toDataURL()
        
        // When zoomed out to less than 100%, for some very strange reason,
        // some browsers report devicePixelRatio as less than 1
        // and only part of the canvas is cleared then.
        let ratio = Math.max(window.devicePixelRatio || 1, 1)

        // This part causes the canvas to be cleared
        canvas.width = canvas.offsetWidth * ratio
        canvas.height = canvas.offsetHeight * ratio
        canvas.getContext("2d").scale(ratio, ratio)

        // This library does not listen for canvas changes, so after the canvas is automatically
        // cleared by the browser, SignaturePad#isEmpty might still return false, even though the
        // canvas looks empty, because the internal data of this library wasn't cleared. To make sure
        // that the state of this library is consistent with visual state of the canvas, you
        // have to clear it manually.
        signaturePad.clear()
        
        if (image)
            signaturePad.fromDataURL(image).then(r => r);
    }
    
    clear(e) {
        signaturePad.clear()
        e.preventDefault()
    }
}