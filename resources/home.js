window.addEventListener('DOMContentLoaded', (event) => {
	//if js is enabled, show carousel_nav
	document.getElementById("carousel_nav").style.display = "block";
	
	// Grab the data-images attribute from the div with the id 'carousel_container'
	var images = JSON.parse(document.querySelector('#carousel_container').getAttribute('data-images'));

	// Iterate through the images array and preload each one
	for(var i = 0; i < images.length; i++) {
		new Image().src = images[i];
	}
	
	// Get all posts with the 'data-isodate' attribute
	let posts = Array.from(document.querySelectorAll('.post[data-isodate]'));

	// Get today's date
	let today = new Date();

	// Format today's date to match the 'data-isodate' attribute format
	let todayFormatted = today.toISOString().substring(0, 10);

	// Split posts into future and past
	let futurePosts = posts.filter(post => post.getAttribute('data-isodate') >= todayFormatted);
	let pastPosts = posts.filter(post => post.getAttribute('data-isodate') < todayFormatted);

	// Sort future posts in ascending order
	futurePosts.sort((a, b) => a.getAttribute('data-isodate').localeCompare(b.getAttribute('data-isodate')));

	// Merge sorted arrays
	let sortedPosts = futurePosts.concat(pastPosts);

	// Get parent element
	let parent = posts[0].parentNode;

	// Remove all posts from DOM
	for (let post of posts) {
		parent.removeChild(post);
	}

	// Insert marker for past events at correct position
	let pastEventsAdded = false;
	for (let i = 0; i < sortedPosts.length; i++) {
		let post = sortedPosts[i];
		if (post.getAttribute('data-isodate') < todayFormatted && !pastEventsAdded) {
			// Insert the past events marker before the current post
			let marker = document.createElement('div');
			marker.classList.add('past_events_marker');
			marker.innerHTML = `<div class="past_text noselect">Past Events</div><div class="past_line"></div>`;
			parent.appendChild(marker);
			pastEventsAdded = true;
		}
		// Add post back into DOM
		parent.appendChild(post);
	}
	
	//handle image carousel
	var carousel = document.querySelector('#carousel_container');
	if (carousel && carousel.hasAttribute('data-images')) {
		var carousel_autoadvance = true;
		var images = JSON.parse(carousel.dataset.images);
		var dots = carousel.querySelectorAll('.carousel_nav_inner .carousel_nav_dot');

		var firstImage = carousel.querySelector('.post_image.first'); //the image we're transitioning from
		firstImage.addEventListener('transitionend', function() {
			this.src = carousel.querySelector('.post_image.second').src;
			this.style.opacity = '1';
			carousel.setAttribute('data-isTransitioning', 'false');
		});

		function advanceCarouselTo(index) {
			var dot = dots[index];
			var isTransitioning = carousel.getAttribute('data-isTransitioning');

			if (isTransitioning === 'true' || dot.classList.contains('active')) {
				return; //ignore clicks during transition
			}

			carousel.querySelectorAll('.carousel_nav_inner .carousel_nav_dot.active').forEach(function(activeDot) {
				activeDot.classList.remove('active');
			});

			dot.classList.add('active');
			var secondImage = carousel.querySelector('.post_image.second'); //the image we're transitioning to
			secondImage.src = images[index];

			firstImage.style.transition = 'opacity 700ms';
			carousel.setAttribute('data-isTransitioning', 'true');
			firstImage.style.opacity = '0';
		}

		dots.forEach(function(dot, index) {
			dot.addEventListener('click', function() {
				advanceCarouselTo(index);

				// Stop auto-advancement on user interaction
				carousel_autoadvance = false;
				if (autoAdvanceInterval) {
					clearInterval(autoAdvanceInterval);
				}
			});
		});

		function autoAdvance() {
			if (!carousel_autoadvance) return;

			var activeDotIndex = Array.from(dots).findIndex(dot => dot.classList.contains('active'));
			var nextIndex = (activeDotIndex + 1) % dots.length;
			advanceCarouselTo(nextIndex);
		}

		var autoAdvanceInterval = setInterval(autoAdvance, 5000); // Start auto-advancement
	}


});