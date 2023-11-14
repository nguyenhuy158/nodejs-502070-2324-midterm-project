/* eslint-disable no-undef */
$(() => {
	const container = $('#container');
	const registerBtn = $('#register');
	const loginBtn = $('#login');

	registerBtn.on('click', () => {
		container.addClass('active');
	});

	loginBtn.on('click', () => {
		container.removeClass('active');
	});

	$('.form-container.sign-up').on('submit', (e) => {
		e.preventDefault();
		const formData = new FormData(e.target);

		const spinner = createAndShowSpinner();
		$.ajax({
			url: "/register",
			type: "POST",
			data: {
				name: formData.get('name'),
				email: formData.get('email'),
				password: formData.get('password'),
				passwordConfirmation: formData.get('passwordConfirmation'),
				_csrf: formData.get('_csrf'),
			},
			success: (result) => {
				console.log(`🚀 result`, result);
				console.log(`🚀 result.message`, result.message);
				if (!result.error) {
					e.target.reset();
				}

			},
			error: (error) => {
				console.log(`🚀 🚀 file: login.js:38 🚀 error`, error);
				toastr.error(error.responseJSON?.message);
			}
		}).always(function () {
			spinner.stop();
		});
	});


	$('.form-container.sign-in').on('submit', function (e) {
		e.preventDefault();
		const formData = new FormData(e.target);


		const spinner = createAndShowSpinner();
		$.ajax({
			url: "/login",
			type: "POST",
			data: {
				email: formData.get('email'),
				password: formData.get('password'),
				_csrf: formData.get('_csrf'),
			},
			success: function (result) {
				console.log(`Result:`, result);
				console.log(`Message:`, result.message);
				toastr.success(result.message);
				if (!result.error) {
					e.target.reset();
					// Redirect to another page after successful login
					window.location.href = '/';
				}
			},
			error: function (xhr, status, error) {
				// Handle any errors here
				console.log(`Error: ${error}`);
				toastr.error(error);
			}
		}).always(function () {
			spinner.stop();
		});
	});
});
