import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  CircularProgress,
  Stack,
  IconButton,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Alert,
  Snackbar
} from "@mui/material";
import {
  Visibility as PreviewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Publish as PublishIcon,
  UnpublishedOutlined as UnpublishIcon,
  Assessment as AssessmentIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import { 
  getDocs, 
  collection, 
  doc, 
  deleteDoc, 
  updateDoc,
  serverTimestamp,
  where,
  query 
} from "firebase/firestore";
import {auth , db } from "../firebase";
import { useNavigate } from "react-router-dom";

// Import your simple notification service
import { sendNotificationToAllUsers } from "../utils/FormService";

const SimpleFormListPage = () => {
  const role = localStorage.getItem('userRole');
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ title: "", description: "" });
  
  // NEW: Notification states
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [sendNotifications, setSendNotifications] = useState(true);
  const [customMessage, setCustomMessage] = useState("");
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  const navigate = useNavigate();

  console.log(forms);

  const isAdmin = role === "admin";

  const fetchForms = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      const userId = user?.uid;
      const snapshot = await getDocs(collection(db, "forms"));
      
      const allData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Raw snapshot:", allData);

      const formList = allData.filter(item => 
        item.formConfig && 
        item.formConfig.formTitle && 
        item.formConfig.pages
      )
      .map(form => ({
        ...form,
        alreadySubmitted: form.submittedUserIds?.includes(userId) || false
      }));
      
      console.log("Filtered forms:", formList);
      setForms(formList);
    } catch (err) {
      console.error("Error fetching forms:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
    checkTokens();
  }, []);

  const handlePreview = (form) => {
    if(!isAdmin) {
      navigate(`/edit/${form.id}`);
    }
    else {
      navigate(`/preview/${form.id}`);
    }
  };

  const checkTokens = async () => {
  const snapshot = await getDocs(collection(db, 'userTokens'));
  console.log('Number of user tokens:', snapshot.docs.length);
  snapshot.docs.forEach(doc => {
    console.log('User:', doc.id, 'Token:', doc.data().token.substring(0, 20) + '...');
  });
};
checkTokens();

  const handleEdit = (form) => {
    if (!isAdmin) {
      alert("Only admins can edit forms");
      return;
    }
    
    localStorage.setItem('formBuilderConfig', JSON.stringify(form.formConfig));
    navigate(`/form-builder?formId=${form.id}&edit=true`);
  };

  const handleDelete = async () => {
    if (!isAdmin || !selectedForm) return;

    try {
      await deleteDoc(doc(db, "forms", selectedForm.id));
      const q = query(collection(db, "formSubmissions"), where("formId", "==", selectedForm.id));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        deleteDoc(doc.ref);
      });
      setForms(forms.filter(form => form.id !== selectedForm.id));
      setDeleteDialogOpen(false);
      setSelectedForm(null);
      alert("Form deleted successfully!");
    } catch (error) {
      console.error("Error deleting form:", error);
      alert("Failed to delete form");
    }
  };

  // UPDATED: New publish function with notifications
  const handlePublishClick = (form) => {
    if (!isAdmin) {
      alert("Only admins can publish/unpublish forms");
      return;
    }

    setSelectedForm(form);
    
    // If form is being published (not unpublished), show notification dialog
    if (!form.published) {
      setCustomMessage(`"${form.formConfig?.formTitle}" form has been published and is now available for submission.`);
      setPublishDialogOpen(true);
    } else {
      // If unpublishing, do it directly without notifications
      handlePublishToggle(form, false);
    }
  };

  // UPDATED: Publish function with notification support
  const handlePublishToggle = async (form, showNotificationDialog = true, sendNotifs = false) => {
    try {
      setNotificationLoading(true);
      
      const newPublishedStatus = !form.published;
      
      await updateDoc(doc(db, "forms", form.id), {
        published: newPublishedStatus,
        publishedAt: newPublishedStatus ? serverTimestamp() : null,
        updatedAt: serverTimestamp()
      });

      setForms(forms.map(f => 
        f.id === form.id 
          ? { ...f, published: newPublishedStatus }
          : f
      ));

      if (newPublishedStatus && sendNotifs) {
        try {
          const result = await sendNotificationToAllUsers(
            'New Form Available',
            customMessage || `"${form.formConfig?.formTitle}" form has been published and is now available.`,
            form.id
          );
          
          setSuccessMessage(`Form published and ${result.sent} users notified!`);
        } catch (notificationError) {
          console.error('Failed to send notifications:', notificationError);
          setSuccessMessage('Form published but notifications failed to send.');
        }
      } else {
        setSuccessMessage(`Form ${newPublishedStatus ? 'published' : 'unpublished'} successfully!`);
      }

    } catch (error) {
      console.error("Error updating form:", error);
      alert("Failed to update form status");
    } finally {
      setNotificationLoading(false);
      setPublishDialogOpen(false);
    }
  };

  const handleConfirmPublish = () => {
    handlePublishToggle(selectedForm, true, sendNotifications);
  };

  const handleEditFormDetails = async () => {
    if (!isAdmin || !selectedForm) return;

    try {
      const updatedFormConfig = {
        ...selectedForm.formConfig,
        formTitle: editFormData.title,
        description: editFormData.description
      };

      await updateDoc(doc(db, "forms", selectedForm.id), {
        formConfig: updatedFormConfig,
        updatedAt: serverTimestamp()
      });

      setForms(forms.map(f => 
        f.id === selectedForm.id 
          ? { ...f, formConfig: updatedFormConfig }
          : f
      ));

      setEditDialogOpen(false);
      setSelectedForm(null);
      alert("Form updated successfully!");
    } catch (error) {
      console.error("Error updating form:", error);
      alert("Failed to update form details");
    }
  };

  const openDeleteDialog = (form) => {
    setSelectedForm(form);
    setDeleteDialogOpen(true);
  };

  const handleViewSubmissions = (form) => {
    navigate(`/submissions?formId=${form.id}`);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "No date";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading forms...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">
            {isAdmin ? 'Form Management' : 'Available Forms'}
          </Typography>
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/form-builder')}
            >
              Create New Form
            </Button>
          )}
        </Stack>
      </Box>

      {forms.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No forms found
          </Typography>
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/form-builder')}
            >
              Create First Form
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {forms
            .filter(form => isAdmin || form.published)
            .sort((a, b) => {
              const aDate = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
              const bDate = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
              return bDate - aDate;
            })
            .map((form) => (
              <Grid item xs={12} sm={6} md={4} key={form.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    position: 'relative'
                  }}
                >
                  {/* Status Chip */}
                  {isAdmin && (
                    <Chip
                      label={form.published ? 'Published' : 'Draft'}
                      color={form.published ? 'success' : 'default'}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 1
                      }}
                    />
                  )}

                  <CardContent sx={{ flexGrow: 1, pt: isAdmin ? 5 : 2 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {form.formConfig?.formTitle || 'Untitled Form'}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ mb: 2, minHeight: 40 }}
                    >
                      {form.formConfig?.description || 'No description'}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      Created: {formatDate(form.createdAt)}
                    </Typography>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                      <IconButton
                        color="primary"
                        onClick={() => handlePreview(form)}
                        title="Preview Form"
                        size="small"
                      >
                        <PreviewIcon />
                      </IconButton>

                      {isAdmin && (
                        <>
                          <IconButton
                            color="secondary"
                            onClick={() => handleEdit(form)}
                            title={Array.isArray(form.submittedUserIds) && form.submittedUserIds.length > 0 ? "Cannot edit: Form has submissions" : "Edit Form"}
                            size="small"
                            disabled={Array.isArray(form.submittedUserIds) && form.submittedUserIds.length > 0}
                          >
                            <EditIcon />
                          </IconButton>

                          {/* UPDATED: Publish button with notification support */}
                          <IconButton
                            color={form.published ? 'warning' : 'success'}
                            onClick={() => handlePublishClick(form)}
                            title={form.published ? 'Unpublish Form' : 'Publish Form & Notify Users'}
                            size="small"
                            disabled={notificationLoading}
                          >
                            {notificationLoading ? (
                              <CircularProgress size={20} />
                            ) : (
                              <>
                                {form.published ? <UnpublishIcon /> : <PublishIcon />}
                              </>
                            )}
                          </IconButton>

                          <IconButton
                            color="info"
                            onClick={() => handleViewSubmissions(form)}
                            title="View Submissions"
                            size="small"
                          >
                            <AssessmentIcon />
                          </IconButton>

                          <IconButton
                            color="error"
                            onClick={() => openDeleteDialog(form)}
                            title="Delete Form"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}

                      {!isAdmin && (
                        <>
                          {form.alreadySubmitted ? (
                            <Chip
                              label="Already Submitted"
                              color="info"
                              sx={{ ml: 'auto' }}
                            />
                          ) : (
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handlePreview(form)}
                              sx={{ ml: 'auto' }}
                            >
                              Start Form
                            </Button>
                          )}
                        </>
                      )}
                    </Stack>
                  </CardActions>
                </Card>
              </Grid>
            ))}
        </Grid>
      )}

      {/* NEW: Publish with Notifications Dialog */}
      <Dialog 
        open={publishDialogOpen} 
        onClose={() => setPublishDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            {/* <NotificationsIcon color="primary" /> */}
            <Typography variant="h6">
              Publish Form & Notify Users
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
           <strong>"{selectedForm?.formConfig?.formTitle}"</strong>
          </Typography>

          {/* <FormControlLabel
            control={
              <Switch
                checked={sendNotifications}
                onChange={(e) => setSendNotifications(e.target.checked)}
                color="primary"
              />
            }
            label="Send push notifications to all users"
            sx={{ mb: 2, mt: 2 }}
          /> */}

          {sendNotifications && (
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Custom notification message (optional)"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder={`"${selectedForm?.formConfig?.formTitle}" form has been published and is now available.`}
              sx={{ mb: 2 }}
            />
          )}

          {/* <Alert severity={sendNotifications ? "info" : "warning"}>
            {sendNotifications ? (
              <>📱 All users who enabled notifications will be instantly notified about this form.</>
            ) : (
              <>📝 Form will be published without sending notifications. Users will need to check the forms page.</>
            )}
          </Alert> */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPublishDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmPublish}
            variant="contained"
            disabled={notificationLoading}
            startIcon={ <PublishIcon />}
          >
            {notificationLoading ? 'Publishing...' : 'Publish Form'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Form</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedForm?.formConfig?.formTitle}"? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Form Details Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Form Details</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Form Title"
            fullWidth
            variant="outlined"
            value={editFormData.title}
            onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={editFormData.description}
            onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleEditFormDetails} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SimpleFormListPage;