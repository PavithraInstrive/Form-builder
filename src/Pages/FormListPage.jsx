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
} from "@mui/material";
import {
  Visibility as PreviewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Publish as PublishIcon,
  UnpublishedOutlined as UnpublishIcon,
  Assessment as AssessmentIcon,
} from "@mui/icons-material";
import { 
  getDocs, 
  collection, 
  doc, 
  deleteDoc, 
  updateDoc,
  serverTimestamp 
} from "firebase/firestore";
import {auth , db } from "../firebase";
import { useNavigate } from "react-router-dom";

const SimpleFormListPage = () => {
    const role = localStorage.getItem('userRole');
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ title: "", description: "" });
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
  }, []);

  const handlePreview = (form) => {
    // localStorage.setItem('formBuilderConfig', JSON.stringify(form.formConfig));
    if(!isAdmin) {
    navigate(`/edit/${form.id}`);
    }
    else {
      navigate(`/preview/${form.id}`);
    }
  };

  const handleEdit = (form) => {
    if (!isAdmin) {
      alert("Only admins can edit forms");
      return;
    }
    
    localStorage.setItem('formBuilderConfig', JSON.stringify(form.formConfig));
    // Go to form builder in edit mode
    navigate(`/form-builder?formId=${form.id}&edit=true`);
  };

  const handleDelete = async () => {
    if (!isAdmin || !selectedForm) return;

    try {
      await deleteDoc(doc(db, "forms", selectedForm.id));
      setForms(forms.filter(form => form.id !== selectedForm.id));
      setDeleteDialogOpen(false);
      setSelectedForm(null);
      alert("Form deleted successfully!");
    } catch (error) {
      console.error("Error deleting form:", error);
      alert("Failed to delete form");
    }
  };

  const handlePublishToggle = async (form) => {
    if (!isAdmin) {
      alert("Only admins can publish/unpublish forms");
      return;
    }

    try {
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
      
      alert(`Form ${newPublishedStatus ? 'published' : 'unpublished'} successfully!`);
    } catch (error) {
      console.error("Error updating form:", error);
      alert("Failed to update form status");
    }
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
    <Container maxWidth="lg" >
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" >
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

                          <IconButton
                            color={form.published ? 'warning' : 'success'}
                            onClick={() => handlePublishToggle(form)}
                            title={form.published ? 'Unpublish Form' : 'Publish Form'}
                            size="small"
                          >
                            {form.published ? <UnpublishIcon /> : <PublishIcon />}
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
    </Container>
  );
};

export default SimpleFormListPage;