import './SyncCobrowsing.css';

import React from 'react';
import SyncClient from 'twilio-sync';
import axios from 'axios';

import Participants from './Participants.js'
import SyncedInputField from './SyncedInputField';
import { useState } from 'react';

const SyncCobrowsing =({ onSendAppointment, lastId }) => {
    const clearData = {
      ownerName: '',
      petName: '',
      aptDate: '',
      aptTime: '',
      aptNotes: ''
    }
    let [toggleForm, setToggleForm] = useState(false)
    let [formData, setFormData] = useState(clearData)
  
    function formDataPublish() {
      const appointmentInfo = {
        id: lastId + 1,
        ownerName: formData.ownerName,
        petName: formData.petName,
        aptDate: formData.aptDate + ' ' + formData.aptTime,
        aptNotes: formData.aptNotes
      }
      onSendAppointment(appointmentInfo);
      setFormData(clearData);
      setToggleForm(!toggleForm)
    }

    return(
   
        <React.Fragment>
        <div className="container">
            <div className="card border-primary">
                <div className="card-header text-info">
                    {/* <span id="status">{this.state.status}</span> */}
                </div>
                <div className="card-header text-info">
                    Participants:<br />
                    {/* <Participants participants={this.state.participants}/> */}
                </div>
            </div>
            <div className="card border-primary">
                <div className="card-header text-info">
                    <div className="input-group mb-3">
                   
                    <label>
                    Owner Name:
                    <input type="text" name="ownerName" id="ownerName"
                    onChange={(event) => { setFormData({ ...formData, ownerName: event.target.value }) }}
                    value={formData.ownerName} /> 
                    </label>
                    </div>
                    <div className="input-group mb-3">
                    <label>
                    Pet Name:
                        <input type="text" name="petName" id="petName"
                        onChange={(event) => { setFormData({ ...formData, petName: event.target.value }) }}
                        value={formData.petName} />
                        </label>
                    </div>
                    <div className="input-group mb-3">
                    <label>
                    Appointment Date:
                        <input type="text" name="aptDate" id="aptDate"
                        onChange={(event) => { setFormData({ ...formData, aptDate: event.target.value }) }}
                        value={formData.aptDate} />
                        </label>
                    </div>
                    <div className="input-group mb-3">
                    <label>
                    Appointment Time:
                        <input type="text" name="aptTime" id="aptTime"
                        onChange={(event) => { setFormData({ ...formData, aptTime: event.target.value }) }}
                        value={formData.aptTime} />
                        </label>
                    </div>
                    <div className="input-group mb-3">
                    <label>
                    Appoint Notes::
                        <input type="text" name="aptNotes" id="aptNotes"
                        onChange={(event) => { setFormData({ ...formData, aptNotes: event.target.value }) }}
                        value={formData.aptNotes} />
                        </label>
                    </div>
                </div>
                <button type="submit" onClick={formDataPublish} >
                Submit
            </button>
            </div>
        </div>
        </React.Fragment>
    );
  }
    

    export default SyncCobrowsing;