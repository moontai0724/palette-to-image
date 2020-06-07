jQuery(window).ready(init);

var vueImpl;

function init() {
    vueImpl = new Vue({
        el: "#vue-content",
        data: {
            displaySettings: false,
            displayBorder: true,
            blockWidth: 50,
            blockHeight: 50,
            blockMargin: 10,
            imageWidth: 600,
            imagePadding: 10,
            colorFormatError: false,
            pickedColor: "",
            lastColor: "",
            selectedColors: [
                ["#1B1412"],
                ["#2B1E1D", "#353020", "#424345", "#454917", "#585338", "#5B5C15"],
                ["#63605F", "#656B47", "#6A766E", "#7B7A3B", "#7C8563", "#95AC74", "#989F93", "#998F70", "#ABABA9", "#ADB88D", "#C1C1C2", "#C7A27D"],
                ["#CCCEE0", "#CDC485", "#D6D4AE", "#D6DEED", "#ECECED"]
            ],
            generatedImages: []
        },
        methods: {
            AddColor: function () {
                if (this.colorFormatError == false) {
                    this.selectedColors.push(this.pickedColor.split(",").sort().filter(colorHex => !this.selectedColors.flat().includes(colorHex)));
                }
            },
            removeColor: function (colorToRemove) {
                this.selectedColors = this.selectedColors.map(arr => arr.filter(color => color != colorToRemove));
                this.removeEmpty();
            },
            clearColor: function () {
                this.selectedColors = [];
            },
            removeEmpty: function () {
                this.selectedColors = this.selectedColors.filter(arr => arr.length > 0);
            },
            generateImage: function () {
                let element = document.querySelector("#selected-colors");
                html2canvas(element, {
                    backgroundColor: null,
                    scrollX: -window.scrollX,
                    scrollY: -window.scrollY,
                }).then(canvas => {
                    jQuery("#images").prepend(`<hr class="ui divider">`);
                    jQuery("#images").prepend(canvas);
                });
            }
        },
        watch: {
            pickedColor: function () {
                this.colorFormatError = false;
                this.pickedColor = this.pickedColor.toUpperCase();
                this.pickedColor = this.pickedColor.replace(/#+/, "#").replace(/[^0-9A-F#,]/g, "").split(",").map((value, index, arr) => {
                    if (!value.startsWith("#"))
                        value = "#" + value;

                    if (!isColor(value.toUpperCase()))
                        this.colorFormatError = true;

                    if (index == arr.length - 1)
                        this.lastColor = value;

                    return value;
                }).join(",");
            },
            colorFormatError: function () {
                if (this.colorFormatError)
                    this.lastColor = "";
            }
        }
    });
    $("select.checkbox").checkbox();
}

function isColor(colorHex) {
    const s = new Option().style;
    s.color = colorHex;
    return s.color !== '';
}