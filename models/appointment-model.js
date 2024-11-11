import mongoose from "mongoose";
import { Schema } from "mongoose";

const appointmentSchema = new mongoose.Schema({
    userId: {
        type : Schema.Types.ObjectId,
        ref : 'User'
    },
    doctorId : {
        type : Schema.Types.ObjectId,
        ref : 'Doctor'
    },
    appointmentTime : {
        date : {
            type : String
        },
        time : {
            type : String
        }
    },
    status: {
         type: String,
        enum: ['pending', 'accepted', 'declined','completed'],
        default: 'pending'
    },
     
})

const appointmentModel = mongoose.model('Appointment', appointmentSchema);

export default appointmentModel;