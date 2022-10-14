class ApiResponse {
	constructor(res) {
		this.res = res;
	}

	response({ data = {}, msg = "success", code = 200, error_code = "SUC200" }) {
		return this.res.status(code).json({
			message: msg,
			code: error_code,
			data: data,
		});
	}

	catch({ msg = "something went wrong", code = 500, error }) {
		msg = error.message;
		let err = msg.split("::");

		let error_code = "ERR500";
		let split_err = err[0] || "500-ERR500";
		split_err = split_err.toString().split("-");
		let response_code = parseInt(err[0]) || code;

		if (split_err.length > 1) {
			response_code = parseInt(split_err[0]) || code;
			error_code = split_err[1];
		}
		let response_msg = err[1] || msg;

		if (err.length < 2) {
			response_msg = "Request failed";
		}

		let err_str = response_msg.split("&&");
		let response_obj = {};
		if (err_str.length > 1) {
			for (let i = 0; i < err_str.length; i++) {
				const element = err_str[i].split("=");
				if (element.length > 1) {
					response_obj[`${element[0].trim()}`] = element[1].trim();
				}
			}
			response_msg = response_obj || err[1] || msg;
		}

		return this.res.status(response_code).json({
			message: response_msg,
			code: error_code,
		});
	}
}

module.exports = ApiResponse;