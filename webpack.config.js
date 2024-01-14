module.exports = (env) => {
	if (env !== 'production') {
		Object.defineProperty(workboxPlugin, 'alreadyCalled', {
			get() {
				return false
			},
			set() {}
		})
	}
}