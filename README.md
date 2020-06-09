# BigSlider 1.0.0
Simple responsive slider

# Installation
```html
<link rel="stylesheet" type="text/css" href="YOUR_INSTALLATION/bigslider.css" media="all">
<script type="text/javascript" src="YOUR_INSTALLATION/bigslider.js"></script>
```

# Example
```html
<div id="homepage-slider" class="bigslider" use-indicator="1" use-navigation="1" break-points="320,768" start="0" autoplay="5000">
    <div class="wrapper">
        <div class="slides">
            <a class="slide" href="#1"
               data-img-320="mobile-slide-1.jpg"
               data-img-768="desktop-slide-1.jpg"
            ></a>
            <a class="slide" href="#2"
               data-img-320="mobile-slide-2.jpg"
               data-img-768="desktop-slide-2.jpg"
            ></a>
            <a class="slide" href="#2"
               data-img-320="mobile-slide-3.jpg"
               data-img-768="desktop-slide-3.jpg"
            ></a>
            <a class="slide" href="#2"
               data-img-320="mobile-slide-4.jpg"
               data-img-768="desktop-slide-4.jpg"
            ></a>
        </div>
    </div>
</div>
<script type="application/javascript">
(function () {
	var homepage_slider = new BigSlider('#homepage-slider');
})();
</script>
```

### Attributes
| Attribute | Example | Required | Notes |
| ------------- |:-------------:| :-----:| -----:|
| class | `bigslider` | Yes | For JS and CSS to work properly |
| use-indicator | `1` or `0` | No | Enables dot indicator at the bottom. On default no indicator will be rendered |
| use-navigation | `1` or `0` | No | Enables left and right arrows at left and right sides. On default no navigation will be rendered |
| break-points | `320,768,960,1160` | Yes | Break points of `window.innerWidth` to switch slide image. This must match the `data-img` attribute |
| start | `0` | No | Index of the slide to start when slider is initialised |
| autoplay | `5000` | No | Enables auto slide. The value is the milliseconds of interval. Values smaller than `1000` will be ignored |
| data-img | `mobile-slide-4.jpg` | Yes | This attribute must match the `break-points` attribute. If `break-points` attribute has `320,640`, each slide must have `data-img-320="image-320-path.jpg"` and `data-img-640="image-640-path.jpg"`. Otherwise slides will be empty.