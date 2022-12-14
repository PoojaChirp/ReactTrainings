import './SyncCobrowsing.css';

import React from 'react';
import SyncClient from 'twilio-sync';
import axios from 'axios';

import Participants from './Participants.js'
import SyncedInputField from './SyncedInputField';

// <SyncCobrowsing sessionId={this.state.sessionId} identity={this.state.identity}/> :

class SyncCobrowsing extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      status: 'Connecting...',
      errorMessage: '',
      participants: [],
      formData: {
        id: '',
        petName: '',
        ownerName: '',
        aptNotes: '',
        aptDate: ''
      }
    };

    this.setFormValue = this.setFormValue.bind(this);
  }

  //  formDataPublish(){

  //   const petInfo = {
  //     id: lastId + 1,
  //     ownerName: formData.ownerName,
  //     petName: formData.petName,
  //     aptDate: formData.aptDate + ' ' + formData.aptTime,
  //     aptNotes: formData.aptNotes
  //   }
  //   // onSendPetInfo(petInfo);
  //   this.setFormValue = this.setFormValue.bind(onSendPetInfo(petInfo));

  // }

  componentDidMount() {
    // fetch an access token from the localhost server
    this.retrieveToken(this.props.identity);
  }

  componentWillUnmount() {
    this.removeParticipant(this.props.identity);
  }

  async retrieveToken(identity) {
    let result = await axios.get('/token/' + this.props.identity);
    let accessToken = result.data.token;
    if (accessToken != null) {
      if (this.client) {
        // update the sync client with a new access token
        this.refreshSyncClient(accessToken);
      } else {
        // create a new sync client
        this.createSyncClient(accessToken);
      }
    } else {
      this.setState({'errorMessage':'No access token found in result'});
    }
  }

  // updateSyncDocument(formData) {
  //   if (!this.client) {
  //     return;
  //   }
  //   this.client.document(this.props.sessionId).then(function(doc) {
  //     doc.set(formData);
  //   });
  // }

  updateSyncList(formData) {
    if (!this.client) {
      return;
    }
    this.client.list("OrangesList").then(function(list) {
      list.push(formData);
   // list.removeList() .then(() => { console.log('List removeList() successful'); }) .catch((error) => { console.error('List removeList() failed', error); });
    });
  }

  getParticipantsKey() {
    return 'participants-' + this.props.sessionId;
  }

  addParticipant(identity) {
    this.client.map(this.getParticipantsKey()).then(function(map) {
      map.set(identity, {
        identity: identity
      }).then(function(item) {
        console.log('Added: ', item.key);
      }).catch(function(err) {
        console.error(err);
      });
    });
  }

  removeParticipant(identity) {
    this.client.map(this.getParticipantsKey()).then(function(map) {
      map.remove(identity)
        .then(function() {
          console.log('Participant ' + identity + ' removed.');
        })
        .catch(function(error) {
          console.error('Error removing: ' + identity, error);
        })
    });
  }

  async subscribeToParticipantsUpdates() {
    var component = this;
    this.client.map(this.getParticipantsKey()).then(function(map) {
      map.on('itemAdded', function(event) {
        component.refreshParticipants(map);
      });

      map.on('itemUpdated', function(event) {
        component.refreshParticipants(map);
      });

      map.on('itemRemoved', function(event) {
        component.refreshParticipants(map);
      });
      
    });
  }

  refreshParticipants(map) {
    this.getAllItems(map).then(items => {
      var participants = [];
      items.forEach(item => {
        participants.push(item.data);
      });
      console.log('participants', participants);
      this.setState({participants: participants});
    });
  }

  // Since Sync Map has pagination we need to navigate through all the pages
  async getAllItems(map) {
      const result = [];
      let page = await map.getItems();
      result.push(...page.items);

      while (page.hasNextPage) {
          page = await page.nextPage();
          result.push(...page.items);
      }
      return result;
  };

  refreshSyncClient(token) {
    this.client.updateToken(token);
  }

  createSyncClient(token) {
    const client = new SyncClient(token, { logLevel: 'info' });
    var component = this;
    let identity = this.props.identity;
    client.on('connectionStateChanged', function(state) {
        if (state === 'connected') {
            component.client  = client;
            component.setState({status:'connected'});
            component.loadFormData();
            component.subscribeToParticipantsUpdates();
            component.addParticipant(identity);
        } else {
          component.setState({
            status:'error', 
            errorMessage:`Error: expected connected status but got ${state}`
          });
        }
    });
    client.on('tokenAboutToExpire', function() {
      component.retrieveToken(identity);
    });
    client.on('tokenExpired', function() {
      component.retrieveToken(identity);
    });
  }

  // async loadFormData() {
  //   let component = this;

  //   this.client.document(this.props.sessionId).then(function(doc) {
  //     component.setState({formData: doc.data});

  //     doc.on("updated",function(data) {
  //       console.log('Sync Updated Data', data);
  //       if (!data.isLocal) {
  //         console.log('Setting state with', data.data);
  //         component.setState({formData: data.data});
  //       }
  //     });
    
  //   });
  // }

  async loadFormData(){
    let component = this;

    this.client.list('OrangesList')
    .then((list) => {
      console.log('Successfully opened a List. SID:', list.sid);
      //component.setState({formData: list.data});
      console.log('form data value is',list.data);
      list.on('itemAdded', function(data) {
        console.log('Sync Updated Data', data);
        if (!data.isLocal) {
          console.log('Setting state with', data.data);
        //  component.setState({formData: data.data});
        }
    });
  });   
  }

  // setFormValue(fieldName,value) {
  //   var formData = this.state.formData;
  //   formData[fieldName] = value;
  //   this.setState({formData: formData}, () => this.updateSyncDocument(formData));
  // }

  setFormValue(fieldName,value) {
    var formData = this.state.formData;
    formData[fieldName] = value;
    this.setState({formData: formData});
   // this.setState({formData: formData}, () => this.updateSyncList(formData));
    console.log("success updatelist");
  }


  render() {
    return (
      <React.Fragment>
        <div className="container">
            <div className="card border-primary">
                <div className="card-header text-info">
                    <span id="status">{this.state.status}</span>
                </div>
                <div className="card-header text-info">
                    Participants:<br />
                    <Participants participants={this.state.participants}/>
                </div>
            </div>
            <div className="card border-primary">
                <div className="card-header text-info">
                    <div className="input-group mb-3">
                      {/* <SyncedInputField
                        setFormValue={this.setFormValue}
                        formDataKey="pid" 
                        formDataValue={this.state.formData['pid']} 
                        placeholder="ID"/> */}
                        <label>
                    ID :
                    <input type="text" name="id" id="id"
                    onChange={(event) => { this.setState({formData:{id : event.target.value}})}}
                    value={this.state.value } /> 
                    </label>
                    </div>
                    <div className="input-group mb-3">
                      {/* <SyncedInputField
                        setFormValue={this.setFormValue}
                        formDataKey="petName" 
                        formDataValue={this.state.formData['petName']} 
                        placeholder="Pet Name"/> */}
                        <label>
                    Owner Name :
                    <input type="text" name="ownerName" id="ownerName"
                    onChange={(event) => { this.setState({formData:{ownerName : event.target.value}})}}
                    value={this.state.value } /> 
                    </label>
                    </div>
                    <div className="input-group mb-3">
                      {/* <SyncedInputField
                        setFormValue={this.setFormValue}
                        formDataKey="ownerName" 
                        formDataValue={this.state.formData['ownerName']} 
                        placeholder="Owner Name"/> */}
                         <label>
                    Pet Name :
                    <input type="text" name="petName" id="petName"
                    onChange={(event) => { this.setState({formData:{petName : event.target.value}})}}
                    value={this.state.value } /> 
                    </label>
                    </div>
                    <div className="input-group mb-3">
                      {/* <SyncedInputField
                        setFormValue={this.setFormValue}
                        formDataKey="aptDate" 
                        formDataValue={this.state.formData['aptDate']} 
                        placeholder="Apt Date"/> */}
                         <label>
                    Appointment Date :
                    <input type="text" name="aptDate" id="aptDate"
                    onChange={(event) => { this.setState({formData:{aptDate : event.target.value}})}}
                    value={this.state.value } /> 
                    </label>
                    </div>
                    <div className="input-group mb-3">
                      {/* <SyncedInputField
                        setFormValue={this.setFormValue}
                        formDataKey="aptTime" 
                        formDataValue={this.state.formData['aptTime']} 
                        placeholder="Apt Time"/> */}
                        <label>
                    Appointment Notes :
                    <input type="text" name="aptNotes" id="aptNotes"
                    onChange={(event) => { this.setState({formData:{aptNotes : event.target.value}})}}
                    value={this.state.value } /> 
                    </label>
                    </div>
                </div>
                <button type="submit" onClick={this.updateSyncList(this.state.formData)} >Submit </button>
            </div>
           
        </div>
        <span id="floating-badges"></span>
        <span id="signals"></span>
      </React.Fragment>
    );
  }

}

export default SyncCobrowsing;
