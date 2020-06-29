'use strict';

function BigSlider (selector) {
	var _this = this;

	// Validation
    if (typeof selector !== 'string' || selector.replace(/\s+/g, '') === '') throw 'BigSlider requires a valid string CSS selector';
	if (!document.querySelector(selector)) throw 'Cannot find a valid DOM element by selector';
	this.slider = document.querySelector(selector);
	this.wrapper = this.slider.querySelector('.wrapper');
	this.container = this.slider.querySelector('.slides');
	this.goto_left = document.createElement('div');
	this.goto_right = document.createElement('div');

	this.autoplay = false;
	this.break_points = [];
	this.current = 0;
	this.current_time = new Date().getTime();
	this.match_proportion = false;
	this.moving = false;
	this.use_indicator = false;
	this.use_navigation = false;
	this.indicator = document.createElement('div');
	this.indicator.classList.add('indicator');
	this.goto_left.classList.add('goto');
	this.goto_right.classList.add('goto');
	this.goto_left.setAttribute('step', '-1');
	this.goto_right.setAttribute('step', '1');
	this.slider.setAttribute('current', 0);
	this.interval_id = 0;

	if (this.slider.getAttribute('autoplay') !== null) {
		this.autoplay = parseInt(this.slider.getAttribute('autoplay'));
		if (this.autoplay > 1000) {
			this.setTimer();
		} else {
			console.warn('autoplay must be greater than 1000');
        }
    }

	if (this.slider.getAttribute('match-proportion') !== null && this.slider.getAttribute('match-proportion') === '1') {
		this.match_proportion = true;
	}

	if (this.slider.getAttribute('current') !== null && !isNaN(this.slider.getAttribute('current'))) {
		this.current = parseInt(this.slider.getAttribute('current'));
    } else {
		this.slider.setAttribute('current', this.current);
	}

	if (this.slider.getAttribute('break-points')) {
		this.slider.getAttribute('break-points').split(',').forEach(function (each) {
            _this.break_points.push(parseInt(each));
        });
    }

	if (this.slider.getAttribute('animation')) {
		if (['dropin', 'slide'].indexOf(this.slider.getAttribute('animation')) > -1) {
			this.animation = this.slider.getAttribute('animation');
		} else {
			this.animation = 'slide';
			this.slider.setAttribute('animation', 'slide');
		}
	} else {
		this.animation = 'slide';
		this.slider.setAttribute('animation', 'slide');
	}

	this.goto_left.innerHTML = '<i class="icon-left-arrow"></i>';
	this.goto_right.innerHTML = '<i class="icon-right-arrow"></i>';

	if (this.slider.getAttribute('use-indicator')) {
		this.use_indicator = true;
		this.wrapper.appendChild(this.indicator);
    }

	if (this.slider.getAttribute('use-navigation')) {
		this.use_navigation = true;
		this.wrapper.insertAdjacentElement('afterbegin', this.goto_right);
		this.wrapper.insertAdjacentElement('afterbegin', this.goto_left);
    }

	this.goto_left.addEventListener('click', function (e) {
		var step = parseInt(e.currentTarget.getAttribute('step'));
		_this.gotoSlide(_this.current + step);
    });

	this.goto_right.addEventListener('click', function (e) {
		var step = parseInt(e.currentTarget.getAttribute('step'));
		_this.gotoSlide(_this.current + step);
    });

	// Dimensions
    this.slider.style.height = (this.slider.getBoundingClientRect().width * 9 / 16) + 'px';

    // Initialisation
    this.init();
}

BigSlider.prototype.getCurrentPoint = function () {
	var current_point = window.innerWidth, _this = this,
        filtered = this.break_points.filter(function (break_point) {
            return current_point > break_point;
        });
	current_point = filtered.length ? filtered[filtered.length - 1] : this.break_points[0];
	return current_point;
};

BigSlider.prototype.gotoSlide = function (n, force) {
	if (this.current == n && (typeof force === 'boolean' && force === false)) return;
	var width = this.slider.getBoundingClientRect().width,
        total = Object.keys(this.slides).length,
        dots = this.indicator.querySelectorAll('.dot'),
        _this = this;
	if (isNaN(n) || n >= total) {
		n = 0;
    } else {
		if (n < 0) n = (total - 1);
    }

	// Moving means animation not finished, then cancel
	if (this.moving) return;
	this.moving = true;
	var timeout_id = setTimeout(function () {
		if (_this.current !== n) {
			_this.current_time = new Date().getTime();
		}
		_this.current = n;
		_this.slider.setAttribute('current', n);
		_this.moving = false;
		clearTimeout(timeout_id);
	}, 200); // CSS transition duration .2s

	switch (this.animation) {
		case 'dropin':
			for (var d in this.slides) {
				if (n === parseInt(d)) {
					this.slides[d].el.setAttribute('active', '');
				} else {
					this.slides[d].el.removeAttribute('active');
				}
			}
			break;
		case 'slide':
			this.container.style.left = '-' + (n * width) + 'px';
			break;
	}
	for (var i = 0; i < dots.length; i++) {
		if (parseInt(dots[i].getAttribute('slide')) === n) {
			dots[i].setAttribute('current', 1);
		} else {
			dots[i].setAttribute('current', 0);
		}
	}
};

BigSlider.prototype.init = function () {
	var slides = this.slider.querySelectorAll('.slides .slide'), _this = this;
	this.slides = {};
	if (this.current > slides.length - 1) this.current = 0;
	if (slides.length) {
		for (var i = 0; i < slides.length; i ++) {
			var dot = document.createElement('div'), slide = slides[i];
			this.slides[i] = {el: slide, images: {}};

			slide.classList.add('not-ready');
			slide.setAttribute('current', this.current === i ? 1 : 0);

			if (this.break_points.length) {
				this.break_points.forEach(function (break_point) {
					if (slide.getAttribute('data-img-' + break_point)) {
						_this.slides[i].images[break_point] = slide.getAttribute('data-img-' + break_point);
					}
				});
			} else {
				for (var p = 0; p < slide.attributes.length; p ++) {
					var attr = slide.attributes[p], break_point;
					if (/^data-img-(\d+)$/gi.test(attr.name)) {
						break_point = parseInt(attr.name.replace('data-img-', ''));
						if (this.break_points.indexOf(break_point) === -1) {
							this.break_points.push(break_point);
							this.slides[i].images[break_point] = attr.value;
						}
					}
				}
			}
			this.break_points.sort(function (a, b) {return a - b});
			this.slider.setAttribute('break-points', this.break_points.join(','));

			dot.addEventListener('click', function (e) {
                _this.gotoSlide(parseInt(e.currentTarget.getAttribute('slide')));
            });

			dot.classList.add('dot');
			dot.setAttribute('slide', i);
			this.indicator.appendChild(dot);
		}
		this.loadImages();
	}

	window.addEventListener('resize', function () {
		_this.size(function () {
            _this.setDisplay(function () {
            	_this.gotoSlide(_this.current);
            });
        });
    });

	this.gotoSlide(this.current, true);
	this.observe();
};

BigSlider.prototype.loadImage = function (point, src, slide, cb) {
	var img = new Image(), el = document.createElement('img');
	el.setAttribute('point', point);
	el.style.display = 'none';
	slide.appendChild(el);
    img.onload = function(e) {
        el.setAttribute('data-height', this.height);
        el.setAttribute('data-width', this.width);
        el.setAttribute('data-ratio', this.width / this.height);
        el.src = src;
        slide.classList.remove('not-ready');
        cb ? cb(this.height, this.width) : null;
    };
    img.src = src;
};

BigSlider.prototype.loadImages = function () {
	var total = 0, count = 0, _this = this;
	for (var i in this.slides) {
		var each = this.slides[i];
		total += Object.keys(each.images).length;
		for (var point in each.images) {
			this.loadImage(point, each.images[point], each.el, function () {
				count ++;
				if (count >= total) {
					_this.size(function () {
						_this.setDisplay(function () {
                            _this.gotoSlide(_this.current);
                        });
                    });
                }
            });
        }
    }
};

/**
 * Set up mutation observer
 */
BigSlider.prototype.observe = function () {
	var _this = this;
	var _id = setInterval(function () {
		if (!isNaN(parseInt(_this.slider.getAttribute('current'))) && parseInt(_this.slider.getAttribute('current')) !== _this.current) {
			_this.gotoSlide(parseInt(_this.slider.getAttribute('current')));
			_this.current = parseInt(_this.slider.getAttribute('current'));
		}
	}, 100);
};

BigSlider.prototype.setDisplay = function (cb) {
    var current_point = this.getCurrentPoint();
	for (var i in this.slides) {
		var each = this.slides[i];
		var slide = each.el, imgs = slide.querySelectorAll('img');
		for (var m = 0; m < imgs.length; m ++) {
			var img = imgs[m];
			if (parseInt(img.getAttribute('point')) !== current_point) {
				img.style.display = 'none';
            } else {
				img.style.display = 'block';
			}
        }
	}
	cb ? cb() : null;
};

BigSlider.prototype.setTimer = function () {
	var progress = document.createElement('div'),
        inner = document.createElement('div'),
        bar = document.createElement('div'),
        _this = this;
	this.wrapper.insertAdjacentElement('afterbegin', progress);
	progress.appendChild(bar);
	progress.appendChild(inner);
	inner.appendChild(bar);

	progress.classList.add('progress');
	inner.classList.add('inner');
	bar.classList.add('bar');

	var timeout = this.autoplay / 200 < 1 ? 1 : this.autoplay / 200;
	this.interval_id = setInterval(function () {
		if (!_this.moving) {
			var now = new Date().getTime(),
                percentage = (1 - (now - _this.current_time) / _this.autoplay) * 100;
			if (percentage < 0) percentage = 0;
			bar.style.width = percentage + '%';
			if (now - _this.current_time > _this.autoplay) {
				_this.gotoSlide(_this.current + 1);
			}
		}
    }, timeout);
};

BigSlider.prototype.size = function (cb) {
	var current_point = this.getCurrentPoint(), rect = this.slider.getBoundingClientRect(),
        current_height = 0, _this = this;
	switch (this.animation) {
		case 'dropin':
			this.wrapper.querySelector('.slides').style.width = rect.width + 'px';
			break;
		case 'slide':
			this.wrapper.querySelector('.slides').style.width = (Object.keys(this.slides).length * rect.width) + 'px';
			break;
	}
	for (var i in this.slides) {
		var each = this.slides[i], slide = each.el,
            img = slide.querySelector('[point="' + current_point + '"]') || slide.querySelector('img'),
            ratio = parseFloat(img.getAttribute('data-ratio'));
		current_height = rect.width / ratio;
		slide.style.width = rect.width + 'px';
	}
	this.slider.style.height = current_height + 'px';
	cb ? cb() : null;
};
