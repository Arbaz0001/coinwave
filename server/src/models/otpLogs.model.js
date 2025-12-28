import mongoose from "mongoose"

const otpLogsSchema = new mongoose.Schema({
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    emailOTP: {
        type: String,
        required: true
    },
    verified: {
        type: Boolean
    },
    expiresAt: {
        type: Date
    },
}, {timestamps: true})

export const otpLogs = new mongoose.model("otpLogs", otpLogsSchema)