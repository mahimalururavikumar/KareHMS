import mongoose from "mongoose";
import { Schema } from "mongoose";

const adminSchema = new mongoose.Schema({

    name : {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true,
        unique: true
    },
    allusers : [
        {
            UserId: { type: Schema.Types.ObjectId, ref: 'User' }
        }
    ],
    allDoctors : [
        {
            DoctorId: { type: Schema.Types.ObjectId, ref: 'Doctor' }
        }
        
    ],
    password : {
        type: String,
        required: true
    },

    contact : {
        type : String
    },
    appointments : {
        type: Schema.Types.ObjectId,
        ref : 'appointment'
    },
    isadmin : {
        type : Boolean,
        default: true
    },
    userRequests : [
        {
            userId: { type: Schema.Types.ObjectId, ref: 'Doctor' },
            appicationId: {type: Schema.Types.ObjectId, ref: 'DoctorApplication'},
            request: { type: String },
        }
    ],
    usernotification : [
        {
            message : {type: String},
            status: { type: String, default: 'unread' }
        }
    ],
    
});

const adminModel = mongoose.model('admin', adminSchema);

export default adminModel;