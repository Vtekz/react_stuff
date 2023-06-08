import React, { useState, useEffect } from "react";
import axios from "axios";
import { CopyToClipboard } from "react-copy-to-clipboard";
import ReactMarkdown from "react-markdown";
import TextEditor from "./TextEditor";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Switch,
  Select,
  MenuItem,
  Input,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  createTheme,
  ThemeProvider,
  CssBaseline,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
} from "@mui/material";
import { motion } from "framer-motion";
import "./dark-mode.css";
import "./background-animation.css";

const BlogGenerator = () => {
  const [formData, setFormData] = useState({
    content_type: "",
    target_audience: "",
    keywords: "",
    blog_length: "",
    tone: "",
    additional_instructions: "",
  });
  const [generatedText, setGeneratedText] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [copiedStatus, setCopiedStatus] = useState({});
  const [openEditor, setOpenEditor] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showOtherContentType, setShowOtherContentType] = useState(false);
  const [customContentType, setCustomContentType] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "content_type") {
      setShowOtherContentType(value === "other");
      if (value !== "other") {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  const handleCustomContentTypeChange = (e) => {
    const { value } = e.target;
    setCustomContentType(value);
    setFormData({ ...formData, content_type: value });
  };

  const isGenerateDisabled = () => {
    const { content_type, target_audience, keywords, blog_length, tone } = formData;
    return (
      !content_type || !target_audience || !keywords || !blog_length || !tone
    );
  };

  const handleGenerate = async () => {
    setLoading(true);
    setErrorMessage("");
    const data = {
      content_type: formData.content_type,
      target_audience: formData.target_audience,
      keywords: formData.keywords.split(", "),
      blog_length: parseInt(formData.blog_length, 10),
      tone: formData.tone,
      additional_instructions: formData.additional_instructions.split(", "),
    };

    try {
      const response = await axios.post("http://comfyworkspace.us-east-2.elasticbeanstalk.com/generate", data);
      setGeneratedText(response.data.generated_text);

      // Save the generated blog to localStorage
      const newBlogs = [...blogs, { id: Date.now(), text: response.data.generated_text }];
      setBlogs(newBlogs);
      localStorage.setItem("blogs", JSON.stringify(newBlogs));
    } catch (error) {
      console.error("Error generating text:", error);
      console.error("Error message:", error.response.data.message);
      setErrorMessage("Please try again. Server error.");
    }
    setLoading(false);
  };


  // Load blogs from localStorage
  useEffect(() => {
    const savedBlogs = localStorage.getItem("blogs");
    if (savedBlogs) {
      setBlogs(JSON.parse(savedBlogs));
    }
  }, []);

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      background: {
        default: darkMode ? "#121212" : "#f5f5f5",
      },
    },
  });

  const [openEditors, setOpenEditors] = useState({});

  const handleOpenEditorForBlog = (id) => {
    setOpenEditors({ ...openEditors, [id]: true });
  };

  const handleCloseEditorForBlog = (id) => {
    setOpenEditors({ ...openEditors, [id]: false });
  };
  const generateButtonVariants = {
    idle: {
      rotate: 0,
    },
    dance: {
      rotate: [0, 10, -10, 10, -10, 0],
      transition: {
        duration: 1,
        ease: "easeInOut",
        repeat: Infinity,
      },
    },
  };
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="min-h-screen flex items-center justify-center">
        {/* Background Animation */}
        <div className="background-animation">
          <span>c</span>
          <span>o</span>
          <span>m</span>
          <span>f</span>
          <span>y</span>
          <span>w</span>
          <span>o</span>
          <span>r</span>
          <span>k</span>
          <span>s</span>
          <span>p</span>
          <span>a</span>
          <span>c</span>
          <span>e</span>
        </div>
  
        <Container
          maxWidth="md"
          sx={{
            width: "75%",
            height: "75%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h3"
              component="h1"
              align="center"
              gutterBottom
              sx={{ color: darkMode ? "white" : "black" }}
            >
              AI-powered Blog Generator
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Content Type with predefined options and "Other" */}
              <FormControl fullWidth variant="outlined">
                <InputLabel htmlFor="content_type">Content Type</InputLabel>
                <Select
                  labelId="content_type_label"
                  id="content_type"
                  name="content_type"
                  value={showOtherContentType ? "other" : formData.content_type}
                  onChange={handleChange}
                  label="Content Type"
                >
                  <MenuItem value="Article">Article</MenuItem>
                  <MenuItem value="Tutorial">Tutorial</MenuItem>
                  <MenuItem value="Review">Review</MenuItem>
                  <MenuItem value="Interview">Interview</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
              {showOtherContentType && (
                <TextField
                  id="other_content_type"
                  name="content_type"
                  label="Custom Content Type"
                  value={customContentType}
                  onChange={handleCustomContentTypeChange}
                  fullWidth
                  variant="outlined"
                  sx={{ mt: 1 }}
                />
              )}
              <TextField
                id="target_audience"
                name="target_audience"
                label="Target Audience"
                value={formData.target_audience}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                id="keywords"
                name="keywords"
                label="Keywords (comma-separated)"
                value={formData.keywords}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                id="blog_length"
                name="blog_length"
                type="number"
                label="Blog Length (words)"
                value={formData.blog_length}
                onChange={handleChange}
                onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                id="tone"
                name="tone"
                label="Tone"
                value={formData.tone}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                id="additional_instructions"
                name="additional_instructions"
                label="Additional Instructions (comma-separated)"
                value={formData.additional_instructions}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 1 }}>
              {errorMessage && (
                <Typography variant="body1" color="error">
                  {errorMessage}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 3 }}>
              <motion.div
                initial="idle"
                animate={loading ? "dance" : "idle"}
                variants={generateButtonVariants}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleGenerate}
                  disabled={loading || isGenerateDisabled()}
                >
                  Generate
                </Button>
              </motion.div>
              {generatedText.length > 0 && (
                <CopyToClipboard
                  text={generatedText}
                  onCopy={() => setCopiedStatus({ ...copiedStatus, generated: true })}
                >
                  <Button
                    variant="contained"
                    color="success"
                    as="span"
                    sx={{ display: "inline-block" }}
                  >
                    {copiedStatus.generated ? "Copied!" : "Copy to Clipboard"}
                  </Button>
                </CopyToClipboard>
              )}
            </Box>
            {generatedText.length > 0 && (
              <React.Fragment>
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    Generated Blog
                  </Typography>
                  <Typography 
                    variant="body1"
                    component="div"
                    dangerouslySetInnerHTML={{ __html: generatedText }}
                  />
                </Box>
                <Box>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpenEditorForBlog("generated")}
                  >
                    Open in Text Editor
                  </Button>
                </Box>
              </React.Fragment>
            )}
          </motion.div>
        </Container>
  
        {/* New Blog List */}
        <Box
          sx={{
            position: "absolute",
            top: 2,
            left: 2,
            width: "20%",
            maxHeight: "90%",
            overflowY: "auto",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Generated Blogs
          </Typography>
          <List>
            {blogs.map((blog) => (
              <ListItem key={blog.id} disablePadding>
                <Card sx={{ width: "100%", bgcolor: "background.paper" }}>
                  <CardContent>
                    <Typography variant="body1" component="p">
                      {blog.text.slice(0, 100)}...
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <CopyToClipboard
                      text={blog.text}
                      onCopy={() => setCopiedStatus({ ...copiedStatus, [blog.id]: true })}
                    >
                      <Button size="small" color="success">
                        {copiedStatus[blog.id] ? "Copied!" : "Copy"}
                      </Button>
                    </CopyToClipboard>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => handleOpenEditorForBlog(blog.id)}
                    >
                      Edit
                    </Button>
                  </CardActions>
                </Card>
              </ListItem>
            ))}
          </List>
        </Box>
  
        {/* Dark Mode Switch */}
        <Box sx={{ position: "absolute", top: 2, right: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
                name="darkMode"
                color="primary"
              />
            }
            label="Dark Mode"
          />
        </Box>
      </div>
  
      {/* Text Editor Dialog for Generated Text */}
      <Dialog
        open={openEditors["generated"] || false}
        onClose={() => handleCloseEditorForBlog("generated")}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Text Editor</DialogTitle>
        <DialogContent>
          <TextEditor initialText={generatedText} />
        </DialogContent>
      </Dialog>
  
      {/* Text Editor Dialogs for Each Blog */}
      {blogs.map((blog) => (
        <Dialog
          key={`dialog-${blog.id}`}
          open={openEditors[blog.id] || false}
          onClose={() => handleCloseEditorForBlog(blog.id)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Text Editor - Blog {blog.id}</DialogTitle>
          <DialogContent>
            <TextEditor initialText={blog.text} />
          </DialogContent>
        </Dialog>
      ))}
    </ThemeProvider>
  );
};

export default BlogGenerator;
