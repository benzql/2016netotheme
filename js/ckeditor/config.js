/*
Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/
CKEDITOR.editorConfig = function( config )
{
config.filebrowserBrowseUrl = '/_cpanel?item=ckfinder';
config.filebrowserImageBrowseUrl = '/_cpanel?item=ckfinder&Type=Images';
config.filebrowserFlashBrowseUrl = '/_cpanel?item=ckfinder&Type=Flash';
config.filebrowserUploadUrl = '/assets/js/ckfinder/core/connector/php/connector.php?command=QuickUpload&type=Files';
config.filebrowserImageUploadUrl = '/assets/js/ckfinder/core/connector/php/connector.php?command=QuickUpload&type=Images';
config.filebrowserFlashUploadUrl = '/assets/js/ckfinder/core/connector/php/connector.php?command=QuickUpload&type=Flash';
config.entities = false;
config.allowedContent = true;
config.enterMode = CKEDITOR.ENTER_BR;
config.height = '400px';

};
