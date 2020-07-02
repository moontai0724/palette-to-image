jQuery(window).ready(init);

var vueImpl;

function init() {
    vueImpl = new Vue({
        el: "#vue-content",
        data: {
            displaySettings: false,
            displayColors: true,
            displayColorCode: true,
            displayBorder: true,
            blockWidth: 50,
            blockHeight: 50,
            blockMargin: 10,
            imageWidth: 600,
            imagePadding: 10,
            fixedTextColor: false,
            textColor: "#000000",
            colorFormatError: false,
            pickedColor: "",
            lastColor: "",
            selectedColors: [
                ["#424345"],
                ["#1B1412", "#2B1E1D", "#353020", "#454917", "#5B5C15", "#585338"],
                ["#7B7A3B", "#656B47", "#63605F", "#6A766E", "#7C8563", "#998F70", "#95AC74", "#989F93", "#ABABA9", "#ADB88D", "#CDC485", "#C7A27D"],
                ["#CCCEE0", "#C1C1C2", "#D6D4AE", "#D6DEED"]
            ]
        },
        methods: {
            initializeInput: function () {
                if (this.pickedColor == "")
                    this.pickedColor = "#";
            },
            AddColor: function () {
                if (this.colorFormatError == false) {
                    let colors = this.pickedColor.match(/#[0-9A-F]{0,6}/g);

                    if (colors != null) {
                        colors = colors.filter(colorHex => this.selectedColors.flat().includes(colorHex) === false);

                        if (colors.length > 0)
                            this.selectedColors.push(sortColors(colors.map(hexToRgb)).map(rgbToHex));
                    }
                }
            },
            removeColor: function (colorToRemove) {
                this.selectedColors = this.selectedColors.map(arr => arr.filter(color => color != colorToRemove));
                this.removeEmpty();
            },
            clearColor: function () {
                this.selectedColors = [];
                this.displayColors = true;
                this.displaySettings = false;
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
                this.displayColors = false;
            }
        },
        watch: {
            pickedColor: function (colors) {
                this.colorFormatError = false;
                colors = colors.toUpperCase().match(/#[0-9A-F]{0,6}/g);
                if (colors != null) {
                    colors = colors.filter((color, index, arr) => {
                        if (!isColor(color))
                            this.colorFormatError = true;
                        if (index == arr.length - 1)
                            this.lastColor = color;
                        return arr.indexOf(color) === index;
                    });
                    this.pickedColor = colors.join("");
                } else {
                    this.pickedColor = "";
                }
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

function hexToRgb(hex) {
    hex = hex.substring(1, hex.length);
    var r = parseInt((hex).substring(0, 2), 16);
    var g = parseInt((hex).substring(2, 4), 16);
    var b = parseInt((hex).substring(4, 6), 16);

    return [r, g, b];
}

function rgbToHex(rgb) {
    return "#" + ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1).toUpperCase();
}

function colorDistance(color1, color2) {
    // This is actually the square of the distance but
    // this doesn't matter for sorting.
    var result = 0;
    for (var i = 0; i < color1.length; i++)
        result += (color1[i] - color2[i]) * (color1[i] - color2[i]);
    return result;
}

function sortColors(colors) {
    // Calculate distance between each color
    var distances = [];
    for (var i = 0; i < colors.length; i++) {
        distances[i] = [];
        for (var j = 0; j < i; j++)
            distances.push([colors[i], colors[j], colorDistance(colors[i], colors[j])]);
    }
    distances.sort(function (a, b) {
        return a[2] - b[2];
    });

    // Put each color into separate cluster initially
    var colorToCluster = {};
    for (var i = 0; i < colors.length; i++)
        colorToCluster[colors[i]] = [colors[i]];

    // Merge clusters, starting with lowest distances
    var lastCluster;
    for (var i = 0; i < distances.length; i++) {
        var color1 = distances[i][0];
        var color2 = distances[i][1];
        var cluster1 = colorToCluster[color1];
        var cluster2 = colorToCluster[color2];
        if (!cluster1 || !cluster2 || cluster1 == cluster2)
            continue;

        // Make sure color1 is at the end of its cluster and
        // color2 at the beginning.
        if (color1 != cluster1[cluster1.length - 1])
            cluster1.reverse();
        if (color2 != cluster2[0])
            cluster2.reverse();

        // Merge cluster2 into cluster1
        cluster1.push.apply(cluster1, cluster2);
        delete colorToCluster[color1];
        delete colorToCluster[color2];
        colorToCluster[cluster1[0]] = cluster1;
        colorToCluster[cluster1[cluster1.length - 1]] = cluster1;
        lastCluster = cluster1;
    }

    // By now all colors should be in one cluster
    return lastCluster;
}
