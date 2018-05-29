const tl = new TimelineMax({
		delay: .5,
		repeat: -1,
		repeatDelay: 1.2
	}),
	select = function (s) {
		return document.querySelector(s);
	},
	selectAll = function (s) {
		return document.querySelectorAll(s);
	};

tl.fromTo('.lp1', 1, {
	y: -20,
	opacity: 0
}, {
	y: 0,
	opacity: 1
});
tl.fromTo('.lp2', 1, {
	y: -20,
	opacity: 0
}, {
	y: 0,
	opacity: 1
}, 0.5);
tl.fromTo('.lp4', 1.4, {
	drawSVG: '0%'
}, {
	drawSVG: '100%',
	ease: Power3.easeOut
}, 1);
tl.fromTo('.lp3', 1.4, {
	drawSVG: '0%'
}, {
	drawSVG: '100%',
	ease: Power3.easeOut
}, 1);

export const timeline = tl;
