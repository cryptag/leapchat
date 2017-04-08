(function(){
'use strict';

miniLock.UI = {}

// Automatically setup and start the onscreen interface when the
// 'startOnLoad' class is present on <body>. Guards against running
// setup and start functions in the test kit.
$(window).load(function() {
	if ($(document.body).hasClass('startOnLoad')) {
		miniLock.UI.setup()
		miniLock.UI.start()
		// Pickup file input in Chrome App processes.
		if (window.chrome && window.chrome.runtime) {
			window.chrome.runtime.getBackgroundPage(function(process){
				// If the process was launched with a file...
				if (process.launchFileEntry) {
					// Set miniLock.session.launchFile to an instance of File so that it
					// can be decrypted immediately after miniLock is unlocked.
					process.launchFileEntry.file(function(file){
						miniLock.session.launchFile = file
					})
				}
			})
		}
	}
})


// UI Startup
miniLock.UI.start = function() {
	$('[data-utip]').utip()
	$('input.miniLockEmail').focus()
	$('span.dragFileInfo').html(
		$('span.dragFileInfo').data('select')
	)
}

// - - - - - - - - - - - -
// Bind to Events
miniLock.UI.setup = function() {

// -----------------------
// Unlock UI Bindings
// -----------------------

$('input.showMiniLockKey').on('click', function() {
	if ($('input.miniLockKey').attr('type') === 'password') {
		$('input.miniLockKey').attr('type', 'text')
	}
	else {
		$('input.miniLockKey').attr('type', 'password')
	}
})

$('form.unlockForm').on('submit', function() {
	var emailMatch = new RegExp(
		'[-0-9a-zA-Z.+_]+@[-0-9a-zA-Z.+_]+\\.[a-zA-Z]{2,20}'
	)
	var email = $('input.miniLockEmail').val()
	var key   = $('input.miniLockKey').val()
	if (!email.length || !emailMatch.test(email)) {
		$('div.unlockInfo').text($('div.unlockInfo').data('bademail'))
		$('input.miniLockEmail').select()
		return false
	}
	if (!key.length) {
		$('div.unlockInfo').text($('div.unlockInfo').data('nokey'))
		$('input.miniLockKey').select()
		return false
	}
	if (miniLock.crypto.checkKeyStrength(key, email)) {
		$('input.miniLockKey').attr('type', 'password')
		$('div.unlock').animate({marginTop: 90})
		$('div.unlockInfo').animate({height: 20})
		$('div.unlockInfo').text($('div.unlockInfo').data('keyok'))
		$('input.miniLockKey').attr('readonly', 'readonly')
		miniLock.crypto.getKeyPair(key, email, function(keyPair) {
			miniLock.session.keys = keyPair
			miniLock.session.keyPairReady = true
		})
		// Keep polling until we have a key pair
		var keyReadyInterval = setInterval(function() {
			if (miniLock.session.keyPairReady) {
				clearInterval(keyReadyInterval)
				$('div.myMiniLockID code').text(
					miniLock.crypto.getMiniLockID(
						miniLock.session.keys.publicKey
					)
				)
				if (miniLock.session.launchFile) {
					miniLock.UI.handleFileSelection(miniLock.session.launchFile)
					delete miniLock.session.launchFile
					miniLock.UI.flipToBack()
					setTimeout(function(){
						$('div.unlock').hide()
						$('div.selectFile').show()
						$('div.squareFront').css({backgroundColor: '#7090ad'})
					}, 500)
				}
				else {
					$('div.unlock').delay(200).fadeOut(200, function() {
						$('div.selectFile').fadeIn(200)
						$('div.squareFront').animate({
							backgroundColor: '#7090ad'
						})
					})
				}
			}
		}, 100)
	}
	else {
		$('div.unlockInfo').html(
			Mustache.render(
				miniLock.templates.keyStrengthMoreInfo,
				{
					phrase: miniLock.phrase.get(7)
				}
			)
		)
		$('div.unlock').animate({marginTop: 50})
		$('div.unlockInfo').animate({height: 190})
		$('div.unlockInfo input[type=text]').unbind().click(function() {
			$(this).select()
		})
		$('div.unlockInfo input[type=button]').unbind().click(function() {
			$('div.unlockInfo input[type=text]').val(
				miniLock.phrase.get(7)
			)
		})
	}
	return false
})

// -----------------------
// File Select UI Bindings
// -----------------------

$('div.fileSelector').on('dragover', function() {
	$('span.dragFileInfo').html(
		$('span.dragFileInfo').data('drop')
	)
	return false
})

$('div.fileSelector').on('dragleave', function() {
	$('span.dragFileInfo').html(
		$('span.dragFileInfo').data('select')
	)
	return false
})


$('div.fileSelector').on('drop', function(e) {
	$('span.dragFileInfo').html(
		$('span.dragFileInfo').data('read')
	)
	e.preventDefault()
	// Treat the dropped file as a DataTransferItem
	// such to easily convert it to an DataTransferEntry
	// using Webkit. This way we can take advantage of
	// the attribute isDirectory
	var items = e.originalEvent.dataTransfer.items
	var item = null
	for (var i = 0; i < items.length; i++) {
		if (items[i].kind === 'file') {
			item = items[i]
			break
		}
	}
	if (!item) {
		throw new Error('miniLock: File handling failed - not valid file')
	}
	if (item.webkitGetAsEntry().isDirectory) {
		// Sadly, works only using Webkit at the moment...
		miniLock.UI.handleDirectorySelection(item.webkitGetAsEntry())
	} else {
		miniLock.UI.handleFileSelection(item.getAsFile())
	}

	return false
})

$('div.fileSelector').click(function() {
	$('input.fileSelectDialog').click()
})

$('input.fileSelectDialog').change(function(e) {
	e.preventDefault()
	if (!this.files) {
		return false
	}
	$('span.dragFileInfo').html(
		$('span.dragFileInfo').data('read')
	)
	var file = this.files[0]
	// Pause to give the operating system a moment to close its
	// file selection dialog box so that the transition to the
	// next screen will be smoother.
	setTimeout(function(){
		miniLock.UI.handleFileSelection(file)
	}, 600)
	return false
})

// Click to select user's miniLock ID for easy copy-n-paste.
$('div.myMiniLockID,div.senderID').click(function() {
	var range = document.createRange()
	range.selectNodeContents($(this).find('code').get(0))
	var selection = window.getSelection()
	selection.removeAllRanges()
	selection.addRange(range)
})

miniLock.UI.handleDirectorySelection = function(directory) {
	$('span.dragFileInfo').html(
		$('span.dragFileInfo').data('zip')
	)
	var walk = function(dir, done) {
		var results = []
		dir.createReader().readEntries(function(list) {
			var pending = list.length
			if (!pending) {
				return done(results, null)
			}
			list.forEach(function(l) {
				if (l.isDirectory) {
					walk(l, function(res) {
						results = results.concat(res)
						if (!--pending) {
							done(results, null)
						}
					})
				}
				else {
					l.file(function(file) {
						var reader = new FileReader()
						reader.onload = function() {
							results.push({
								// Using slice for making relative path from absolute one
								// This make miniLock more portable as told by users of Windows
								path: l.fullPath.slice(1),
								content: reader.result
							})
							if (!--pending) {
								done(results, null)
							}
						}
						reader.readAsArrayBuffer(file)
					})
				}
			})
		}, function(err) {
			return done(err)
		})
	}
	// Walk through the tree, then zip the result
	// and call handleFileSelection using it as
	// the file to encrypt
	walk(directory, function(res, err) {
		if (err) {
			throw err
		}
		var zip = new JSZip()
		res.forEach(function(r) {
			zip.file(r.path, r.content)
		})
		var archive = new Blob([zip.generate({type: 'blob'})], {})
		// We add a name attribute to our archive such to
		// fake handleFileSelection dealing with a true File,
		// not a Blob
		archive.name = directory.name + '.zip'
		$('span.dragFileInfo').html(
			$('span.dragFileInfo').data('read')
		)
		miniLock.UI.handleFileSelection(archive)
	})
}

// Handle file selection via drag/drop, select dialog or OS launch.
miniLock.UI.handleFileSelection = function(file) {
	miniLock.util.resetCurrentFile()
	miniLock.session.currentFile.fileObject = file
	var miniLockFileYes = new Uint8Array([
		0x6d, 0x69, 0x6e, 0x69,
		0x4c, 0x6f, 0x63, 0x6b
	])
	var operation = 'decrypt'
	miniLock.file.read(miniLock.session.currentFile.fileObject, 0, 8, function(result) {
		for (var i = 0; i < result.data.length; i++) {
			if (result.data[i] !== miniLockFileYes[i]) {
				operation = 'encrypt'
			}
		}
		setTimeout(function() {
			$('span.dragFileInfo').html(
				$('span.dragFileInfo').data('select')
			)
		}, 1000)
		if (operation === 'encrypt') {
			$('form.process').trigger('encrypt:setup', miniLock.session.currentFile.fileObject)
		}
		if (operation === 'decrypt') {
			miniLock.crypto.decryptFile(
				miniLock.session.currentFile.fileObject,
				miniLock.crypto.getMiniLockID(
					miniLock.session.keys.publicKey
				),
				miniLock.session.keys.secretKey,
				miniLock.crypto.decryptionCompleteCallback
			)
			$('form.process').trigger('decrypt:start', {
				name: miniLock.session.currentFile.fileObject.name,
				size: miniLock.session.currentFile.fileObject.size
			})
		}
		miniLock.UI.flipToBack()
	}, function() {
		$('span.dragFileInfo').html(
			$('span.dragFileInfo').data('error')
		)
	})
}

// Accept and decrypt miniLock files sent to the application
// from the operating system (usually from a double-click).
if (window.chrome && window.chrome.app && window.chrome.app.runtime) {
	window.chrome.app.runtime.onLaunched.addListener(function(input){
		if (miniLock.session && input.items && input.items[0]) {
			input.items[0].entry.file(function(file){
				miniLock.UI.handleFileSelection(file)
				miniLock.UI.flipToBack()
			})
		}
	})
}

// -----------------------
// Back-to-front UI Bindings
// -----------------------

$('input.flipBack').click(function() {
	miniLock.UI.expireLinkToSaveFile()
	miniLock.UI.flipToFront()
})

miniLock.UI.flipToFront = function() {
	$('form.fileSelectForm input[type=reset]').click()
	$('#utip').hide()
	$('div.squareContainer').removeClass('flip')
}

miniLock.UI.flipToBack = function() {
	$('#utip').hide()
	$('div.squareContainer').addClass('flip')
}

// -----------------------
// Encrypting a File
// -----------------------

// Setup the screen for a new unencrypted file.
$('form.process').on('encrypt:setup', function(event, file) {
	$('form.process').removeClass(miniLock.UI.resetProcessFormClasses)
	$('form.process').addClass('unprocessed')
	var originalName = file.name
	var inputName	= file.name
	var randomName   = miniLock.util.getRandomFilename()
	var outputName   = $('form.process').hasClass('withRandomName') ? randomName : originalName
	miniLock.UI.renderAllFilenameTags({
		'input':	inputName,
		'output':   outputName,
		'original': originalName,
		'random':   randomName
	})
	if ($('form.process').hasClass('withRandomName')) {
		$('form.process div.random.name').addClass('activated')
		$('form.process div.original.name').addClass('shelved')
	}
	else {
		$('form.process div.output.name').addClass('activated')
	}
	// Render the size of the input file.
	$('form.process a.fileSize').html(miniLock.UI.readableFileSize(file.size))
	// Insert the sender's miniLock ID if the list is empty.
	if ($('form.process div.blank.identity').size() === 0) {
		for (var i = 0; i < 4; i++) {
			$('form.process div.miniLockIDList').append(Mustache.render(
				miniLock.templates.recipientListIdentity,
				{'className': 'blank'}
			))
		}
	}
	if ($('form.process div.blank.identity').size() === $('form.process div.identity').size()) {
		var myMiniLockID = miniLock.crypto.getMiniLockID(miniLock.session.keys.publicKey)
		$('form.process div.blank.identity:first-child').replaceWith(Mustache.render(
			miniLock.templates.recipientListIdentity,
			{'className': 'session', 'id': myMiniLockID, 'label': 'Me'}
		))
	}
	$('form.process div.blank.identity input[type=text]').first().focus()
	var withoutMyMiniLockID = $('form.process div.session.identity:not(.expired)').size() === 0
	$('form.process').toggleClass('withoutMyMiniLockID', withoutMyMiniLockID)
	$('form.process input.encrypt').prop('disabled', false)
})

// Set the screen to show the progress of the encryption operation.
$('form.process').on('encrypt:start', function(event, fileSize) {
	$('form.process').removeClass('unprocessed')
	$('form.process').addClass('encrypting')
	$('input.encrypt').prop('disabled', true)
	miniLock.UI.animateProgressBar(0, fileSize)
})

// Set the screen to save an encrypted file.
$('form.process').on('encrypt:complete', function(event, file) {
	$('form.process').removeClass('encrypting')
	$('form.process').addClass('encrypted')
	// Render encrypted file size.
	$('form.process a.fileSize').text(miniLock.UI.readableFileSize(file.size))
	// Render link to save encrypted file.
	miniLock.UI.renderLinkToSaveFile(file)
	// Render identity of the sender.
	$('form.process div.senderID code').text(file.senderID)
	// Summarize who can access the file.
	var recipientIDs = $('form.process div.identity:not(.blank) input[type=text]').map(function() {
		return this.value.trim()
	}).toArray()
	var myMiniLockID = miniLock.crypto.getMiniLockID(miniLock.session.keys.publicKey)
	var recipientsSummary = miniLock.UI.summarizeRecipients(recipientIDs, myMiniLockID)
	if (
		recipientsSummary.senderCanDecryptFile
	) {
		if (recipientsSummary.totalRecipients > 0) {
			$('form.process div.summary').text(
				'File can be decrypted by its sender and '
				+ recipientsSummary.totalRecipients + ' recipient(s).'
			)
		}
		else {
			$('form.process div.summary').text(
				'File can be decrypted by its sender only.'
			)
		}
	}
	else if (recipientsSummary.totalRecipients > 0) {
		$('form.process div.summary').text(
			'File can be decrypted by '
			+ recipientsSummary.totalRecipients + ' recipient(s).'
		)
	}
})

// Display encryption error message, reset progress bar, and then flip back.
$('form.process').on('encrypt:failed', function(event, errorCode) {
	$('form.process').removeClass('encrypting')
	$('form.process').addClass('encrypt failed')
	$('form.process div.failureNotice').text(
		$('form.process div.failureNotice').data('error-' + errorCode)
	)
	$('form.process div.progressBarFill').css({
		'width': '0',
		'transition': 'none'
	})
	setTimeout(function() {
		miniLock.UI.flipToFront()
	}, 7500)
})

// Set a random filename and put the original on the shelf.
$('form.process').on('mousedown', 'div.setRandomName a.control', function() {
	var randomName = miniLock.util.getRandomFilename()
	$('form.process').addClass('withRandomName')
	$('form.process div.original.name').addClass('shelved')
	$('form.process div.random.name').addClass('activated')
	miniLock.UI.renderFilenameTag('random', randomName)
	$('form.process div.output.name').removeClass('activated')
	miniLock.UI.renderFilenameTag('output', randomName)
})

// Restore the original filename and deactivate the random one.
$('form.process').on('mousedown', 'div.setOriginalName a.control', function() {
	var originalName = $('form.process div.original.name input').val()
	$('form.process').removeClass('withRandomName')
	$('form.process div.original.name').removeClass('shelved')
	$('form.process div.random.name').removeClass('activated')
	$('form.process div.output.name').addClass('activated')
	miniLock.UI.renderFilenameTag('output', originalName)
})

// Validate identity input and classify it as blank, invalid or the same as the current session.
$('form.process').on('input', 'div.identity', function() {
	$(this).removeClass('blank invalid session')
	$(this).find('label').empty()
	var myMiniLockID = miniLock.crypto.getMiniLockID(miniLock.session.keys.publicKey)
	var inputID	  = $(this).find('input[type=text]').val().trim()
	if (inputID.length === 0) {
		$(this).addClass('blank')
	}
	else {
		if (!miniLock.util.validateID(inputID)) {
			$(this).addClass('invalid')
			$(this).find('label').text(
				$(this).data('invalid')
			)
		}
		else if (miniLock.UI.isDuplicateID(inputID)) {
			$(this).addClass('invalid')
			$(this).find('label').text(
				$(this).data('duplicate')
			)
		}
		else if (inputID === myMiniLockID) {
			$(this).addClass('session')
			$(this).find('label').text(
				$(this).data('me')
			)
		}
	}
	var withoutMyMiniLockID = $('form.process div.session.identity:not(.expired)').size() === 0
	$('form.process').toggleClass('withoutMyMiniLockID', withoutMyMiniLockID)
	if ($('form.process div.blank.identity').size() === 0) {
		$('form.process div.miniLockIDList').append(Mustache.render(
			miniLock.templates.recipientListIdentity,
			{'className': 'blank'}
		))
		$('form.process > div').first().stop().animate({
			scrollTop: $('form.process > div').first().prop('scrollHeight')
		}, 1500)
	}
})

// Remove an identity from the list.
$('form.process').on('mousedown', 'div.identity input.remove', function() {
	var identity = $(this).closest('div.identity')
	identity.find('input.code').blur()
	identity.addClass('expired')
	identity.find('input.code').trigger('input')
	identity.bind('transitionend', function(event){
		if ($(event.target).is(identity)) {
			identity.remove()
			$('form.process div.blank.identity input[type=text]:first').focus()
		}
	})
	if ($('form.process div.identity:not(.expired)').size() < 4) {
		$('form.process div.miniLockIDList').append(Mustache.render(
			miniLock.templates.recipientListIdentity,
			{'className': 'blank'}
		))
	}
})

// Add the session identity to the list.
$('form.process').on('mousedown', 'a.addMyMiniLockIDtoRecipientList', function() {
	var myMiniLockID = miniLock.crypto.getMiniLockID(miniLock.session.keys.publicKey)
	$('form.process div.blank.identity').first().replaceWith(Mustache.render(
		miniLock.templates.recipientListIdentity,
		{'className': 'session', 'id': myMiniLockID, 'label': 'Me'}
	))
	$('form.process div.session.identity input.code').trigger('input')
	setTimeout(function(){
		$('form.process div.blank.identity input[type=text]:first').focus()
	}, 1)
})

// Press <return>, or click > to commit the form and begin encrypting.
$('form.process').on('submit', function(event) {
	$('#utip').hide()
	event.preventDefault()
	if ($('div.blank.identity').size() === $('div.identity').size()) {
		$('div.identity input').first().focus()
	}
	else if ($('div.invalid.identity').size()) {
		$('div.invalid.identity input').first().focus()
	}
	else {
		if ($('form.process div.scrollingsurface').prop('scrollTop') !== 0) {
			var scrollDuration = 33 * Math.sqrt($('form.process > div').prop('scrollTop'))
			$('form.process div.scrollingsurface').first().animate({scrollTop: 0}, scrollDuration)
		}
		var miniLockIDs = $('div.identity:not(.blank) input[type=text]').map(function() {
			return this.value.trim()
		}).toArray()
		var outputName = $('form.process div.output.name input').val().trim()
		miniLock.crypto.encryptFile(
			miniLock.session.currentFile.fileObject,
			outputName,
			miniLockIDs,
			miniLock.crypto.getMiniLockID(
				miniLock.session.keys.publicKey
			),
			miniLock.session.keys.secretKey,
			miniLock.crypto.encryptionCompleteCallback
		)
		$('form.process').trigger('encrypt:start', miniLock.session.currentFile.fileObject.size)
	}
})

// -----------------------
// Decrypting a File
// -----------------------

// Set the screen to show decryption progress for an encrypted file.
$('form.process').on('decrypt:start', function(event, file) {
	$('form.process').removeClass(miniLock.UI.resetProcessFormClasses)
	$('form.process').addClass('decrypting')
	$('form.process input.encrypt').prop('disabled', true)
	// Render input name and let all the other names be undefined.
	miniLock.UI.renderAllFilenameTags({
		'input': file.name.replace(/\.minilock$/i, '')
	})
	// Activate the input name tag.
	$('form.process div.input.name').addClass('activated')
	// Render input file size.
	$('form.process a.fileSize').text(miniLock.UI.readableFileSize(file.size))
	// Animate decryption operation progress
	miniLock.UI.animateProgressBar(0, file.size)
})

// Set the screen to save a decrypted file.
$('form.process').on('decrypt:complete', function(event, file) {
	$('form.process').removeClass('decrypting')
	$('form.process').addClass('decrypted')
	var outputName = file.name
	var inputName  = $('form.process div.input.name input').val()
	miniLock.UI.renderFilenameTag('output', outputName)
	// Highlight differences if the output name differs from the input name.
	if (inputName !== outputName) {
		$('form.process div.output.name').addClass('activated')
		$('form.process div.input.name').removeClass('activated').addClass('expired')
	}
	// Render decrypted file size.
	$('form.process a.fileSize').text(miniLock.UI.readableFileSize(file.size))
	// Render link to save decrypted file.
	miniLock.UI.renderLinkToSaveFile(file)
	// Render identity of the sender.
	$('form.process div.senderID code').text(file.senderID)
	// Render name of the input file in the summary the bottom of the screen.
	$('form.process div.summary').html('Decrypted from ' + Mustache.render(
		miniLock.templates.filename,
		miniLock.UI.getBasenameAndExtensions(inputName)
	))
	// Show the suspect filename notice when applicable.
	var myMiniLockID = miniLock.crypto.getMiniLockID(
		miniLock.session.keys.publicKey
	)
	if (
		miniLock.util.isFilenameSuspicious(outputName)
		&& file.senderID !== myMiniLockID
	) {
		$('form.process').addClass('withSuspectFilename')
	}
})

// Display decryption error message, reset progress bar, and then flip back.
$('form.process').on('decrypt:failed', function(event, errorCode) {
	$('form.process').removeClass('decrypting')
	$('form.process').addClass('decrypt failed')
	$('form.process div.failureNotice').text(
		$('form.process div.failureNotice').data('error' + errorCode)
	)
	$('form.process div.progressBarFill').css({
		'width': '0%',
		'transition': 'none'
	})
	setTimeout(function() {
		miniLock.UI.flipToFront()
	}, 7500)
})

// -----------------------
// Link to Save File (appears on decrypt:complete and encrypt:complete)
// -----------------------

// After you save, expire the link and go back to the front.
$('form.process').on('click', 'a.fileSaveLink', function() {
	setTimeout(function() {
		miniLock.UI.expireLinkToSaveFile()
	}, 100)
	setTimeout(function() {
		miniLock.UI.flipToFront()
	}, 1000)
})

// Toggle `withHintToSave` class on the file construction form
// when you mouse in-and-out so that a helpfull status message
// can be displayed in the form header.
$('form.process').on('mouseover mouseout', 'a.fileSaveLink', function(){
	$('form.process').toggleClass('withHintToSave')
})

}
// - - - - - - - - - - - -
// End of miniLock.UI.setup()

// Remove these classes to reset the file processing <form>.
miniLock.UI.resetProcessFormClasses = ''
	+ 'unprocessed withSuspectFilename withoutMyMiniLockID '
	+ 'encrypting decrypting '
	+ 'encrypted decrypted '
	+ 'encrypt decrypt failed '

miniLock.UI.renderAllFilenameTags = function(filenames){
	$('form.process div.name').removeClass('activated shelved expired')
	$('form.process div.name input').val('')
	$('form.process div.name h1').empty()
	miniLock.UI.renderFilenameTag('input',	filenames.input)
	miniLock.UI.renderFilenameTag('output',   filenames.output)
	miniLock.UI.renderFilenameTag('original', filenames.original)
	miniLock.UI.renderFilenameTag('random',   filenames.random)
}

miniLock.UI.renderFilenameTag = function(className, filename){
	$('form.process div.'+className+'.name input').val(filename)
	$('form.process div.'+className+'.name h1').html(Mustache.render(
		miniLock.templates.filename,
		miniLock.UI.getBasenameAndExtensions(filename)
	))
}

miniLock.UI.renderLinkToSaveFile = function(file) {
	window.URL = window.webkitURL || window.URL
	$('a.fileSaveLink').attr('download', file.name)
	$('a.fileSaveLink').attr('href', window.URL.createObjectURL(file.data))
	$('a.fileSaveLink').data('downloadurl', [
		file.type,
		$('a.fileSaveLink').attr('download'),
		$('a.fileSaveLink').attr('href')
	].join(':'))
	$('a.fileSaveLink').css('height', $('form.process div.activated.name h1').height())
	$('a.fileSaveLink').css('visibility', 'visible')
}

miniLock.UI.expireLinkToSaveFile = function() {
	window.URL = window.webkitURL || window.URL
	window.URL.revokeObjectURL($('a.fileSaveLink')[0].href)
	$('a.fileSaveLink').attr('download', '')
	$('a.fileSaveLink').attr('href', '')
	$('a.fileSaveLink').data('downloadurl', '')
	$('a.fileSaveLink').css('height', 0)
	$('a.fileSaveLink').css('visibility', 'hidden')
}

// Input: Object:
//	{
//		name: File name,
//		size: File size (bytes),
//		data: File data (Blob),
//		type: File MIME type
//	}
//	operation: 'encrypt' or 'decrypt'
//	senderID: Sender's miniLock ID (Base58)
miniLock.UI.fileOperationIsComplete = function(file, operation, senderID) {
	// It seems we're limited with the number of arguments we can pass here.
	file.senderID = senderID
	$('form.process').trigger(operation + ':complete', file)
}

// The crypto worker calls this method when a
// decrypt or encrypt operation has failed.
// Operation argument is either 'encrypt' or 'decrypt'.
miniLock.UI.fileOperationHasFailed = function(operation, errorCode) {
	$('form.process').trigger(operation+':failed', errorCode)
}

// Convert an integer from bytes into a readable file size.
// For example, 7493 becomes '7KB'.
miniLock.UI.readableFileSize = function(bytes) {
	var KB = bytes / 1024
	var MB = KB	/ 1024
	var GB = MB	/ 1024
	if (KB < 1024) {
		return Math.ceil(KB) + 'KB'
	}
	else if (MB < 1024) {
		return (Math.round(MB * 10) / 10) + 'MB'
	}
	else {
		return (Math.round(GB * 10) / 10) + 'GB'
	}
}

// Animate progress bar based on currentProgress and total.
miniLock.UI.animateProgressBar = function(currentProgress, total) {
	var percentage = total ? currentProgress / total * 100 : 0
	// If percentage overflows 100 due to chunkSize greater
	// than the size of the file itself, set it to 100
	percentage = percentage > 100 ? 100 : percentage
	$('form.process div.progressBarFill').css({
		'transition': 'none'
	})
	setTimeout(function(){
		$('form.process div.progressBarFill').css({
			'width': percentage + '%',
			'transition': 'width 1ms linear'
		})
	}, 1)
}

// Input: Filename (String), Offset (Number)
// Output: Object consisting of basename and extensions.
miniLock.UI.getBasenameAndExtensions = function(filename) {
	var pattern = /\.\w+$/
	var basename = filename + ''
	var extensions = []
	while (pattern.test(basename)) {
		extensions.unshift(basename.match(pattern)[0])
		basename = basename.replace(pattern, '')
	}
	return {
		'basename': basename,
		'extensions': extensions.join('')
	}
}

// Input: Recipient IDs (Array), sender's miniLock ID (String)
// Output: {
//	senderCanDecryptFile: Whether sender can decrypt file (Boolean),
//	totalRecipients: Number of total recipients, not including sender, if applicable (Number)
// }
miniLock.UI.summarizeRecipients = function(recipientIDs, myMiniLockID) {
	var totalRecipients	  = recipientIDs.length
	var senderCanDecryptFile = recipientIDs.indexOf(myMiniLockID) === -1 ? false : true
	if (senderCanDecryptFile) {
		totalRecipients--
	}
	return {
		senderCanDecryptFile: senderCanDecryptFile,
		totalRecipients: totalRecipients
	}
}

miniLock.UI.isDuplicateID = function(miniLockID) {
	var miniLockIDs = $('div.identity:not(.blank) input[type=text]').map(function() {
		return this.value.trim()
	}).toArray()
	for (var i = 0, counter = 0; i < miniLockIDs.length; i++) {
		if (miniLockIDs[i] === miniLockID) {
			counter++
		}
	}
	return counter > 1 ? true : false
}

// -----------------------
// Design & Developer Tools
// -----------------------

// Uncomment the following to unlock a demo session automatically.

/* $(window).load(function() {
	if ($(document.body).hasClass('startOnLoad')) {
		$('input.miniLockEmail').val('manufacturing@minilock.io')
		$('input.miniLockKey').val('Sometimes miniLock people use this key when they are working on the software')
		$('form.unlockForm').submit()
	}
}) */


// Quickly setup the default encryption setup screen for design work:
// $('div.squareContainer').addClass('flip')
// $('form.process div.identity:first').addClass('session').removeClass('blank')
// $('form.process div.identity:first label').text('Me')
// $('form.process div.identity:first input.code').val('8xC1iX3zKUcRn1yo2E2KyAoMvyFqE6dpecq4QHsqGVZH')
// $('form.process').trigger(
// 	'encrypt:setup',
// 	{ name: 'Alice Passport Scan.jpg', size: 98320 }
// )

// Quickly setup the decrypt failure screen for design work:
// $('div.squareContainer').addClass('flip')
// $('form.process').addClass('decryping')
// $('form.process div.input.name').addClass('activated')
// $('form.process div.input.name b.basename').text('Alice Passport Scan.jpg')
// $('form.process').trigger(
// 	'decrypt:failed', 'could not validate sender ID'
// )

})()
