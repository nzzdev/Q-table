function getExactPixelWidth(toolRuntimeConfig) {
    if (!toolRuntimeConfig.size || !Array.isArray(toolRuntimeConfig.size.width)) {
        return undefined;
    }
    for (var _i = 0, _a = toolRuntimeConfig.size.width; _i < _a.length; _i++) {
        var width = _a[_i];
        if (width && width.value && width.comparison === '=' && (!width.unit || width.unit === 'px')) {
            return width.value;
        }
    }
    return undefined;
}
module.exports = {
    getExactPixelWidth: getExactPixelWidth
};
