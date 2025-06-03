

const API_BASE = 'http://cop4331summer2025.xyz/LAMPAPI';

let userId = 0;
let firstName = "";
let lastName = "";

function readCookie()
{
	userId = -1;
	let data = document.cookie;
	let splits = data.split(",");
	for(var i = 0; i < splits.length; i++) 
	{
		let thisOne = splits[i].trim();
		let tokens = thisOne.split("=");
		if( tokens[0] == "firstName" )
		{
			firstName = tokens[1];
		}
		else if( tokens[0] == "lastName" )
		{
			lastName = tokens[1];
		}
		else if( tokens[0] == "userId" )
		{
			userId = parseInt( tokens[1].trim() );
		}
	}
	
	if( userId < 0 )
	{
		window.location.href = "index.html";
	}
	else
	{
		document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
		// Auto-load contacts when page loads
		searchContact();
	}
}

function doLogout()
{
	userId = 0;
	firstName = "";
	lastName = "";
	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	window.location.href = "index.html";
}

function addContact()
{
	let newFirstName = document.getElementById("firstNameText").value.trim();
	let newLastName = document.getElementById("lastNameText").value.trim();
	let newPhone = document.getElementById("phoneText").value.trim();
	let newEmail = document.getElementById("emailText").value.trim();
	
	document.getElementById("contactAddResult").innerHTML = "";

	// Validation
	if(newFirstName === "" || newLastName === "")
	{
		document.getElementById("contactAddResult").innerHTML = "First and Last name are required";
		document.getElementById("contactAddResult").style.color = "#95060a";
		return;
	}

	if(newPhone === "" && newEmail === "")
	{
		document.getElementById("contactAddResult").innerHTML = "Please provide either phone number or email";
		document.getElementById("contactAddResult").style.color = "#95060a";
		return;
	}

	// Validate email if provided
	if(newEmail !== "" && !isValidEmail(newEmail))
	{
		document.getElementById("contactAddResult").innerHTML = "Please enter a valid email address";
		document.getElementById("contactAddResult").style.color = "#95060a";
		return;
	}

	let contactData = {
		FirstName: newFirstName,
		LastName: newLastName,
		Phone: newPhone,
		Email: newEmail,
		userId: userId
	};

	fetch(API_BASE + '/AddContacts.php', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(contactData)
	})
	.then(response => response.text())
	.then(data => {
		try {
			const json = JSON.parse(data);
			if (json.error === "") {
				document.getElementById("contactAddResult").innerHTML = "Contact added successfully!";
				document.getElementById("contactAddResult").style.color = "#008000";
				
				// Clear form
				document.getElementById("firstNameText").value = "";
				document.getElementById("lastNameText").value = "";
				document.getElementById("phoneText").value = "";
				document.getElementById("emailText").value = "";
				
				// Refresh contact list
				setTimeout(function() {
					searchContact();
					document.getElementById("contactAddResult").innerHTML = "";
				}, 1500);
			} else {
				document.getElementById("contactAddResult").innerHTML = "Failed to add contact: " + json.error;
				document.getElementById("contactAddResult").style.color = "#95060a";
			}
		} catch (e) {
			document.getElementById("contactAddResult").innerHTML = "Error adding contact";
			document.getElementById("contactAddResult").style.color = "#95060a";
		}
	})
	.catch(error => {
		document.getElementById("contactAddResult").innerHTML = "Network error: " + error;
		document.getElementById("contactAddResult").style.color = "#95060a";
	});
}

function searchContact()
{
	let srch = document.getElementById("searchText").value.trim();
	document.getElementById("contactSearchResult").innerHTML = "";
	
	let searchData = {
		search: srch,
		userId: userId
	};

	fetch(API_BASE + '/SearchContacts.php', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(searchData)
	})
	.then(response => response.text())
	.then(data => {
		try {
			const json = JSON.parse(data);
			
			if (json.results && json.results.length > 0) {
				document.getElementById("contactSearchResult").innerHTML = "Found " + json.results.length + " contact(s)";
				document.getElementById("contactSearchResult").style.color = "#008000";
				
				let contactHtml = "<div class='contact-results'>";
				for (let i = 0; i < json.results.length; i++) {
					const contact = json.results[i];
					contactHtml += `
						<div class='contact-item'>
							<div class='contact-info'>
								<strong>${contact.FirstName} ${contact.LastName}</strong><br>
								${contact.Phone ? 'Phone: ' + contact.Phone + '<br>' : ''}
								${contact.Email ? 'Email: ' + contact.Email : ''}
							</div>
							<div class='contact-actions'>
								<button onclick="editContact('${contact.FirstName}', '${contact.LastName}', '${contact.Phone}', '${contact.Email}')" class="action-btn edit-btn">Edit</button>
								<button onclick="deleteContact('${contact.FirstName}', '${contact.LastName}', '${contact.Phone}', '${contact.Email}')" class="action-btn delete-btn">Delete</button>
							</div>
						</div>
					`;
				}
				contactHtml += "</div>";
				
				document.getElementById("contactList").innerHTML = contactHtml;
			} else {
				if (srch === "") {
					document.getElementById("contactSearchResult").innerHTML = "No contacts found. Add some contacts to get started!";
				} else {
					document.getElementById("contactSearchResult").innerHTML = "No contacts found matching '" + srch + "'";
				}
				document.getElementById("contactSearchResult").style.color = "#ff8800";
				document.getElementById("contactList").innerHTML = "";
			}
		} catch (e) {
			document.getElementById("contactSearchResult").innerHTML = "Error searching contacts";
			document.getElementById("contactSearchResult").style.color = "#95060a";
			document.getElementById("contactList").innerHTML = "";
		}
	})
	.catch(error => {
		document.getElementById("contactSearchResult").innerHTML = "Network error: " + error;
		document.getElementById("contactSearchResult").style.color = "#95060a";
		document.getElementById("contactList").innerHTML = "";
	});
}

function editContact(firstName, lastName, phone, email) {
	// Populate the add form with existing data for editing
	document.getElementById("firstNameText").value = firstName;
	document.getElementById("lastNameText").value = lastName;
	document.getElementById("phoneText").value = phone || "";
	document.getElementById("emailText").value = email || "";
	
	// Change the add button to update mode
	const addButton = document.getElementById("addContactButton");
	addButton.innerHTML = "Update Contact";
	addButton.onclick = function() { updateContact(firstName, lastName, phone, email); };
	
	// Scroll to the add section
	document.getElementById("firstNameText").scrollIntoView({behavior: "smooth"});
	document.getElementById("firstNameText").focus();
	
	document.getElementById("contactAddResult").innerHTML = "Editing contact. Update the information and click 'Update Contact'.";
	document.getElementById("contactAddResult").style.color = "#0066cc";
}

function updateContact(originalFirstName, originalLastName, originalPhone, originalEmail) {
	// First delete the old contact
	deleteContact(originalFirstName, originalLastName, originalPhone, originalEmail, function() {
		// Then add the updated contact
		addContact();
		
		// Reset the button back to add mode
		const addButton = document.getElementById("addContactButton");
		addButton.innerHTML = "Add Contact";
		addButton.onclick = addContact;
	});
}

function deleteContact(firstName, lastName, phone, email, callback) {
	if (!callback && !confirm("Are you sure you want to delete " + firstName + " " + lastName + "?")) {
		return;
	}
	
	let deleteData = {
		FirstName: firstName,
		LastName: lastName,
		Phone: phone || "",
		Email: email || "",
		userId: userId
	};

	fetch(API_BASE + '/DeleteContacts.php', {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(deleteData)
	})
	.then(response => response.text())
	.then(data => {
		try {
			const json = JSON.parse(data);
			if (json.error === "") {
				if (!callback) {
					document.getElementById("contactSearchResult").innerHTML = "Contact deleted successfully!";
					document.getElementById("contactSearchResult").style.color = "#008000";
				}
				
				// Refresh contact list
				setTimeout(function() {
					searchContact();
					if (callback) callback();
				}, 500);
			} else {
				if (!callback) {
					document.getElementById("contactSearchResult").innerHTML = "Failed to delete contact: " + json.error;
					document.getElementById("contactSearchResult").style.color = "#95060a";
				}
			}
		} catch (e) {
			if (!callback) {
				document.getElementById("contactSearchResult").innerHTML = "Error deleting contact";
				document.getElementById("contactSearchResult").style.color = "#95060a";
			}
		}
	})
	.catch(error => {
		if (!callback) {
			document.getElementById("contactSearchResult").innerHTML = "Network error: " + error;
			document.getElementById("contactSearchResult").style.color = "#95060a";
		}
	});
}

function isValidEmail(email) {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}