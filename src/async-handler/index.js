const ApiResponse = require("../api-response")

const asyncHandle = (handler, mongoose) => {
	return async (req, res, next) => {
		const resp = new ApiResponse(res)

		let session
		let opts

		if (mongoose) {
			session = await mongoose.startSession();
			session.startTransaction();
			opts = { session };
		}

		async function commit() {
			await session.commitTransaction();
			session.endSession();
		}

		try {
			return await handler({ req, res, next, opts, commit, body: req.body, params: req.params, query: req.query, headers: req.headers });
		} catch (error) {
			if (mongoose) {
				await session.abortTransaction();
				session.endSession();
			}
			return resp.catch({ error })
		}
	}
}

module.exports = asyncHandle