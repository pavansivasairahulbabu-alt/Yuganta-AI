import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Blog from "./models/Blog.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const blogs = [
	{
		title: "The Generative AI Scientist Roadmap 2026",
		slug: "generative-ai-scientist-roadmap-2026",
		excerpt: "Some people want to \"learn AI.\" Others want to build the future. If you're in the second category, bookmark this right now - because the Generative AI Scientist Roadmap 2026 isn't another cute syllabus. It's the no-nonsense, industry-level blueprint for turning you fro...",
		content: `
# The Generative AI Scientist Roadmap 2026

Some people want to "learn AI." Others want to build the future. If you're in the second category, bookmark this right now - because the Generative AI Scientist Roadmap 2026 isn't another cute syllabus. It's the no-nonsense, industry-level blueprint for turning you from a GenAI enthusiast into a full-stack AI scientist capable of shipping production-grade systems.

## Why This Roadmap Exists

The field of Generative AI is evolving at breakneck speed. What worked in 2024 is already outdated. This roadmap is your compass through the chaos, helping you:

- Master foundational concepts and advanced techniques
- Build real-world projects that matter
- Stay ahead of the curve in AI research and development

## Core Competencies

### 1. Foundational Mathematics
Understanding the mathematics behind AI is crucial. Focus on:
- Linear algebra and matrix operations
- Calculus and optimization
- Probability and statistics
- Information theory

### 2. Deep Learning Fundamentals
Build your neural network expertise:
- Neural network architectures
- Backpropagation and gradient descent
- Regularization techniques
- Training best practices

### 3. Transformer Architecture
The backbone of modern GenAI:
- Attention mechanisms
- Multi-head attention
- Positional encoding
- Transformer variants (BERT, GPT, T5)

### 4. Large Language Models
Go deep into LLMs:
- Pre-training and fine-tuning
- Prompt engineering
- Retrieval-Augmented Generation (RAG)
- Model alignment and RLHF

### 5. Diffusion Models
Master image generation:
- Denoising diffusion probabilistic models
- Stable Diffusion architecture
- ControlNet and fine-tuning
- Video generation techniques

### 6. Multimodal AI
Combine vision and language:
- Vision transformers
- CLIP and image-text models
- Multimodal fusion techniques
- Audio-visual-text models

## Practical Skills

### Development Tools
- Python mastery (PyTorch, TensorFlow)
- Cloud platforms (AWS, GCP, Azure)
- MLOps and deployment
- Version control with Git

### System Design
- Scalable AI architectures
- API design and integration
- Performance optimization
- Cost-effective deployment

## Your 6-Month Sprint

**Months 1-2:** Foundations
- Mathematics review
- Deep learning basics
- First neural network projects

**Months 3-4:** Specialization
- Transformer deep dive
- LLM experimentation
- Build your first GenAI app

**Months 5-6:** Advanced Topics
- Multimodal systems
- Production deployment
- Portfolio development

## Next Steps

Don't just read this - build with it. Start with one project, master the fundamentals, and progressively tackle more complex challenges. The future of AI is being built right now, and you're about to be part of it.

Ready to begin? Choose your first project and start coding today.
		`,
		author: "Aayush Tyagi",
		category: "GenAI",
		tags: ["Generative AI", "Roadmap", "Career", "Learning Path"],
		thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
		readTime: "8 min read",
		featured: true,
		views: 0,
		likes: 0,
		createdAt: new Date("2025-12-02"),
	},
	{
		title: "How to Structure Your Data Science Project (With Frameworks & Best Practices)",
		slug: "structure-data-science-project-frameworks",
		excerpt: "Learn the best practices for organizing your data science projects with proven frameworks that improve collaboration, reproducibility, and deployment success.",
		content: `
# How to Structure Your Data Science Project

A well-structured data science project is the difference between a successful deployment and a maintenance nightmare. This guide will walk you through industry-standard frameworks and best practices.

## Why Structure Matters

Good project structure:
- Improves team collaboration
- Enhances reproducibility
- Simplifies deployment
- Reduces technical debt

## Standard Project Structure

\`\`\`
project/
├── data/
│   ├── raw/
│   ├── processed/
│   └── interim/
├── notebooks/
│   ├── exploratory/
│   └── reports/
├── src/
│   ├── data/
│   ├── features/
│   ├── models/
│   └── visualization/
├── tests/
├── models/
├── docs/
├── requirements.txt
└── README.md
\`\`\`

## Popular Frameworks

### 1. Cookiecutter Data Science
The most widely adopted template that provides:
- Standardized directory structure
- Built-in documentation
- Environment management
- Testing framework

### 2. MLOps-Oriented Structure
For production-ready projects:
- CI/CD integration
- Model versioning
- Experiment tracking
- Deployment automation

## Best Practices

1. **Version Control Everything**: Code, data pipeline configs, model configs
2. **Document Your Dependencies**: Use requirements.txt or environment.yml
3. **Separate Concerns**: Keep data processing, model training, and evaluation separate
4. **Test Your Code**: Write unit tests for critical functions
5. **Track Experiments**: Use tools like MLflow or Weights & Biases

Start your next project with proper structure from day one!
		`,
		author: "Mounish V",
		category: "Data Science",
		tags: ["Data Science", "Best Practices", "Project Management"],
		thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
		readTime: "6 min read",
		featured: false,
		views: 0,
		likes: 0,
		createdAt: new Date("2026-01-04"),
	},
	{
		title: "DeepSeek mHC: Stabilizing Large Language Model Training",
		slug: "deepseek-mhc-stabilizing-llm-training",
		excerpt: "Explore how DeepSeek's mHC approach revolutionizes LLM training stability, enabling more reliable and efficient model development at scale.",
		content: `
# DeepSeek mHC: Stabilizing Large Language Model Training

Training large language models is notoriously unstable. DeepSeek's mHC (mixed-precision Hybrid Composition) approach offers a breakthrough solution.

## The Training Stability Challenge

LLMs face several stability issues:
- Gradient explosions
- Loss spikes
- Divergence during training
- Memory constraints

## What is mHC?

mHC combines:
1. **Mixed-precision training** for memory efficiency
2. **Hybrid composition** of different precision types
3. **Dynamic stability mechanisms**
4. **Gradient clipping strategies**

## Key Benefits

- **40% reduction** in training instabilities
- **30% faster** convergence
- **Better final model** performance
- **Lower infrastructure** costs

## Implementation Details

\`\`\`python
# Example mHC configuration
config = {
    'precision': 'mixed',
    'gradient_clip': 1.0,
    'stability_threshold': 0.05,
    'hybrid_ratio': 0.7
}
\`\`\`

## Real-World Results

Companies using mHC report:
- Smoother training curves
- Fewer failed training runs
- Better resource utilization
- Higher quality models

This approach is becoming the new standard for LLM training stability.
		`,
		author: "Riya Bansal",
		category: "Deep Learning",
		tags: ["LLM", "Training", "DeepSeek", "Optimization"],
		thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800",
		readTime: "5 min read",
		featured: false,
		views: 0,
		likes: 0,
		createdAt: new Date("2026-01-03"),
	},
	{
		title: "15 AI Agents Trends to Watch in 2026",
		slug: "ai-agents-trends-2026",
		excerpt: "Discover the cutting-edge trends shaping the future of AI agents, from autonomous decision-making to multi-agent collaboration systems.",
		content: `
# 15 AI Agents Trends to Watch in 2026

AI agents are evolving from simple chatbots to sophisticated autonomous systems. Here are the trends defining 2026.

## 1. Autonomous Business Agents

AI agents that can:
- Schedule meetings
- Negotiate deals
- Manage workflows
- Make purchasing decisions

## 2. Multi-Agent Collaboration

Agents working together:
- Task decomposition
- Specialized roles
- Conflict resolution
- Emergent behaviors

## 3. Agent Memory Systems

Long-term memory enabling:
- Personalization
- Learning from interactions
- Context retention
- Relationship building

## 4. Tool-Using Agents

Agents that can:
- Use APIs
- Execute code
- Access databases
- Interact with software

## 5. Ethical AI Agents

Built-in ethics:
- Bias detection
- Fairness metrics
- Transparency
- Accountability

## More Trends

6. Edge-deployed agents
7. Industry-specific specialization
8. Natural language interfaces
9. Predictive capabilities
10. Self-improvement mechanisms
11. Human-in-the-loop systems
12. Cross-platform integration
13. Security-first design
14. Explainable decisions
15. Adaptive learning

## The Future is Agentic

AI agents will become as common as apps, transforming how we work, learn, and live.
		`,
		author: "Sarthak Dogra",
		category: "AI Agents",
		tags: ["AI Agents", "Trends", "Future Tech", "Automation"],
		thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
		readTime: "7 min read",
		featured: false,
		views: 0,
		likes: 0,
		createdAt: new Date("2026-01-03"),
	},
	{
		title: "Top 18 Power BI Project Ideas For Practice 2026",
		slug: "power-bi-project-ideas-2026",
		excerpt: "Build your Power BI expertise with these 18 practical project ideas, from beginner-friendly dashboards to advanced analytics solutions.",
		content: `
# Top 18 Power BI Project Ideas For Practice 2026

Power BI is one of the most in-demand skills in data analytics. Here are 18 project ideas to level up your skills.

## Beginner Projects (1-6)

1. **Sales Dashboard**: Track revenue, products, and trends
2. **HR Analytics**: Employee metrics and retention analysis
3. **Social Media Monitor**: Engagement and growth tracking
4. **Personal Finance**: Budget and expense visualization
5. **E-commerce Analysis**: Customer behavior and sales patterns
6. **COVID-19 Tracker**: Case statistics and trends

## Intermediate Projects (7-12)

7. **Customer Segmentation**: RFM analysis and clustering
8. **Supply Chain Dashboard**: Inventory and logistics tracking
9. **Marketing Campaign ROI**: Performance across channels
10. **Website Analytics**: Traffic and conversion funnels
11. **Product Performance**: Sales by category and region
12. **Financial Statement Analysis**: P&L and balance sheets

## Advanced Projects (13-18)

13. **Real-time Stock Market**: Live data integration
14. **Predictive Sales Forecasting**: Time series analysis
15. **Customer Churn Prediction**: ML model integration
16. **Multi-source Data Integration**: Combining APIs and databases
17. **Executive KPI Dashboard**: Company-wide metrics
18. **IoT Sensor Analytics**: Device data visualization

## Tips for Success

- Start with clean data
- Focus on user experience
- Use appropriate visualizations
- Add interactivity
- Tell a story with data

Choose a project that interests you and start building!
		`,
		author: "Nitika Sharma",
		category: "Data Science",
		tags: ["Power BI", "Data Visualization", "Analytics", "Projects"],
		thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
		readTime: "6 min read",
		featured: false,
		views: 0,
		likes: 0,
		createdAt: new Date("2026-01-02"),
	},
	{
		title: "Top 10 Machine Learning Algorithms in 2026",
		slug: "top-machine-learning-algorithms-2026",
		excerpt: "Learn about 10 machine learning algorithms that are transforming data analysis and shaping the future of computing. Read Now!",
		content: `
# Top 10 Machine Learning Algorithms in 2026

Machine learning algorithms are the engines driving AI innovation. Master these 10 to stay competitive.

## 1. Gradient Boosting Machines (GBM)

**Why it's #1:**
- Exceptional accuracy
- Handles complex patterns
- Feature importance insights
- Industry standard for tabular data

**Use cases:** Finance, healthcare predictions, risk assessment

## 2. Transformer Networks

**Breakthrough features:**
- Attention mechanisms
- Parallel processing
- Transfer learning
- State-of-the-art NLP

**Use cases:** Language models, translation, summarization

## 3. Random Forests

**Key advantages:**
- Robust to overfitting
- Handles missing data
- Works with mixed data types
- Easy to interpret

**Use cases:** Classification, regression, feature selection

## 4. Neural Architecture Search (NAS)

**Innovation:**
- Automated model design
- Optimal architecture discovery
- Reduced manual tuning
- Improved performance

**Use cases:** Computer vision, AutoML, optimization

## 5. Graph Neural Networks (GNN)

**Unique capabilities:**
- Relationship modeling
- Non-Euclidean data
- Social network analysis
- Molecular structures

**Use cases:** Recommendation systems, drug discovery

## 6. Variational Autoencoders (VAE)

**Applications:**
- Generative modeling
- Anomaly detection
- Data compression
- Feature learning

## 7. Reinforcement Learning (PPO/DQN)

**Strengths:**
- Decision-making
- Sequential optimization
- Game playing
- Robotics control

## 8. XGBoost

**Why it dominates:**
- Speed and efficiency
- Regularization
- Parallel processing
- Kaggle winner

## 9. LSTM Networks

**Time series mastery:**
- Sequential data
- Long-term dependencies
- Stock prediction
- Speech recognition

## 10. Support Vector Machines (SVM)

**Classic reliability:**
- High-dimensional data
- Kernel tricks
- Classification power
- Theoretical foundation

## Choosing the Right Algorithm

Consider:
- Data type and size
- Problem complexity
- Interpretability needs
- Computational resources

Master these algorithms and you'll be equipped for any ML challenge!
		`,
		author: "Sunil Ray",
		category: "Machine Learning",
		tags: ["Machine Learning", "Algorithms", "Data Science", "AI"],
		thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
		readTime: "10 min read",
		featured: false,
		views: 0,
		likes: 0,
		createdAt: new Date("2025-12-26"),
	},
	{
		title: "How to Structure Your Data Science Project (With Frameworks & Best Practices)",
		slug: "how-to-structure-data-science-project",
		excerpt: "Learn the best practices for organizing your data science projects with proven frameworks that improve collaboration, reproducibility, and deployment success.",
		content: `
# How to Structure Your Data Science Project

A well-structured data science project is the foundation of success. Here's how to organize your work for maximum impact.

## Why Project Structure Matters

Good structure provides:
- **Reproducibility** - Anyone can run your code
- **Collaboration** - Teams work smoothly together
- **Scalability** - Easy to add features
- **Maintainability** - Simple to debug and update

## Recommended Directory Structure

\`\`\`
project/
├── data/
│   ├── raw/
│   ├── processed/
│   └── external/
├── notebooks/
│   ├── exploratory/
│   └── final/
├── src/
│   ├── data/
│   ├── features/
│   ├── models/
│   └── visualization/
├── tests/
├── models/
├── reports/
│   ├── figures/
│   └── documents/
├── requirements.txt
├── README.md
└── setup.py
\`\`\`

## Core Components

### 1. Data Management
- **raw/**: Never modify original data
- **processed/**: Cleaned and transformed data
- **external/**: Third-party datasets

### 2. Code Organization
- **src/**: All source code modules
- **notebooks/**: Jupyter notebooks
- **tests/**: Unit and integration tests

### 3. Documentation
- **README.md**: Project overview
- **requirements.txt**: Dependencies
- **reports/**: Analysis results

## Best Practices

### Version Control
- Use Git from day one
- Meaningful commit messages
- Branch for experiments
- .gitignore for large files

### Environment Management
\`\`\`bash
# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
\`\`\`

### Configuration Files
- config.yaml for parameters
- .env for secrets
- logging.conf for debugging

## Frameworks to Consider

### Cookiecutter Data Science
Popular template with:
- Standardized structure
- Built-in best practices
- Easy setup

### DVC (Data Version Control)
For data management:
- Track large files
- Version datasets
- Share reproducibly

### MLflow
For experiment tracking:
- Log parameters
- Track metrics
- Store models

## Code Quality

### Testing
\`\`\`python
def test_data_loading():
    data = load_data('raw/sample.csv')
    assert not data.empty
    assert 'target' in data.columns
\`\`\`

### Documentation
- Docstrings for functions
- Type hints for clarity
- README with examples

## Deployment Considerations

Structure for production:
- Separate train/inference code
- Configuration management
- Model versioning
- API endpoints

## Common Pitfalls to Avoid

❌ Hardcoded paths
❌ No version control
❌ Mixing raw and processed data
❌ No documentation
❌ Monolithic notebooks

✅ Use relative paths
✅ Git from start
✅ Clear data separation
✅ Document everything
✅ Modular code

## Conclusion

A good project structure is an investment that pays dividends throughout the project lifecycle. Start with a solid foundation and maintain it diligently.
		`,
		author: "Mounish V",
		category: "Data Science",
		tags: ["Data Science", "Project Management", "Best Practices", "Python"],
		thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
		readTime: "8 min read",
		featured: false,
		views: 0,
		likes: 0,
		createdAt: new Date("2026-01-04"),
	},
	{
		title: "15 AI Agents Trends to Watch in 2026",
		slug: "15-ai-agents-trends-2026",
		excerpt: "Discover the cutting-edge trends shaping the future of AI agents, from autonomous systems to agentic workflows that are transforming industries worldwide.",
		content: `
# 15 AI Agents Trends to Watch in 2026

AI agents are evolving rapidly. Here are the 15 most important trends that will define the landscape in 2026.

## 1. Multi-Agent Orchestration

Teams of specialized agents working together:
- Task decomposition and delegation
- Inter-agent communication protocols
- Conflict resolution mechanisms
- Emergent collective intelligence

## 2. Autonomous Code Generation

Agents that write production-ready code:
- Full-stack application generation
- Automated testing and debugging
- Code review and optimization
- Security vulnerability detection

## 3. Agentic RAG Systems

Enhanced retrieval-augmented generation:
- Dynamic knowledge base updates
- Multi-source information synthesis
- Fact-checking and verification
- Context-aware retrieval

## 4. Tool-Using Agents

Advanced function calling capabilities:
- API integration
- Database queries
- File system operations
- External service orchestration

## 5. Memory-Enhanced Agents

Long-term memory systems:
- Episodic memory
- Semantic knowledge graphs
- Personalization at scale
- Learning from interactions

## 6. Self-Improving Agents

Continuous learning mechanisms:
- Feedback loop integration
- Performance optimization
- Error correction
- Skill acquisition

## 7. Ethical AI Agents

Built-in safety and alignment:
- Value alignment frameworks
- Bias detection and mitigation
- Transparency in decision-making
- Human oversight protocols

## 8. Domain-Specific Agents

Specialized vertical solutions:
- Healthcare diagnosis assistants
- Financial analysis agents
- Legal research automation
- Scientific discovery tools

## 9. Multimodal Agents

Processing diverse input types:
- Text, image, audio, video
- Cross-modal reasoning
- Unified understanding
- Rich output generation

## 10. Real-Time Agents

Low-latency decision making:
- Streaming data processing
- Edge deployment
- Millisecond response times
- Continuous adaptation

## 11. Collaborative Agents

Human-AI teamwork:
- Natural language interfaces
- Proactive assistance
- Task handoff mechanisms
- Trust-building features

## 12. Agent Marketplaces

Democratizing agent development:
- Pre-built agent templates
- Plugin ecosystems
- Revenue sharing models
- Community contributions

## 13. Agent Observability

Debugging and monitoring:
- Trace analysis tools
- Performance metrics
- Decision explainability
- Cost tracking

## 14. Federated Agents

Privacy-preserving collaboration:
- Distributed learning
- Data sovereignty
- Secure multi-party computation
- Blockchain integration

## 15. Agent-as-a-Service (AaaS)

Managed agent platforms:
- Serverless deployment
- Auto-scaling
- Pay-per-use models
- Enterprise support

## The Future is Agentic

These trends point to a future where AI agents become indispensable partners in every domain. The question isn't whether to adopt agent technology, but how quickly you can integrate it into your workflows.

Get ahead by experimenting with these emerging patterns today!
		`,
		author: "Sarthak Dogra",
		category: "AI Agents",
		tags: ["AI Agents", "Trends", "Automation", "AgentOps"],
		thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
		readTime: "12 min read",
		featured: false,
		views: 0,
		likes: 0,
		createdAt: new Date("2026-01-03"),
	},
	{
		title: "Top 18 Power BI Project Ideas For Practice 2026",
		slug: "top-18-power-bi-project-ideas-2026",
		excerpt: "Master Power BI with these 18 hands-on project ideas that cover everything from beginner dashboards to advanced analytics and real-world business scenarios.",
		content: `
# Top 18 Power BI Project Ideas For Practice 2026

Want to master Power BI? These 18 project ideas will take you from beginner to expert through practical, real-world applications.

## Beginner Projects (1-6)

### 1. Sales Dashboard
Create a comprehensive sales analytics dashboard:
- Revenue trends
- Top products
- Regional performance
- Sales rep rankings

### 2. HR Analytics
Employee metrics and insights:
- Headcount analysis
- Turnover rates
- Department demographics
- Recruitment funnel

### 3. Financial Report
Monthly financial overview:
- Income statement
- Cash flow analysis
- Budget vs actuals
- KPI cards

### 4. Customer Segmentation
Analyze customer behavior:
- RFM analysis
- Purchase patterns
- Customer lifetime value
- Churn prediction

### 5. Inventory Management
Track stock levels:
- Stock movements
- Reorder points
- Warehouse efficiency
- Supplier performance

### 6. Marketing Campaign Analysis
Measure campaign effectiveness:
- ROI calculations
- Channel performance
- Conversion funnels
- A/B test results

## Intermediate Projects (7-12)

### 7. E-commerce Analytics
Complete online store insights:
- Traffic sources
- Cart abandonment
- Product recommendations
- Customer journey

### 8. Social Media Dashboard
Multi-platform analytics:
- Engagement metrics
- Follower growth
- Content performance
- Sentiment analysis

### 9. Healthcare Dashboard
Patient and facility metrics:
- Patient flow
- Bed occupancy
- Treatment outcomes
- Resource utilization

### 10. Supply Chain Analytics
End-to-end visibility:
- Logistics tracking
- Delivery performance
- Cost optimization
- Risk assessment

### 11. Real Estate Market Analysis
Property insights:
- Price trends
- Market comparisons
- Investment returns
- Geographic heat maps

### 12. Educational Performance
Student and school metrics:
- Grade distribution
- Attendance tracking
- Course completion rates
- Teacher effectiveness

## Advanced Projects (13-18)

### 13. Predictive Maintenance
IoT sensor data analysis:
- Equipment health
- Failure prediction
- Maintenance scheduling
- Cost savings

### 14. Risk Management Dashboard
Enterprise risk monitoring:
- Risk heat maps
- Compliance tracking
- Incident management
- Mitigation strategies

### 15. Customer 360 View
Unified customer profile:
- Transaction history
- Support tickets
- Sentiment analysis
- Next best action

### 16. Competitive Intelligence
Market positioning:
- Competitor analysis
- Market share
- Pricing strategies
- SWOT analysis

### 17. Sustainability Dashboard
Environmental metrics:
- Carbon footprint
- Energy consumption
- Waste management
- ESG reporting

### 18. AI/ML Model Monitor
Track ML model performance:
- Prediction accuracy
- Model drift detection
- Feature importance
- A/B testing results

## Key Power BI Features to Master

### DAX Formulas
\`\`\`dax
Sales YTD = 
TOTALYTD(
    SUM(Sales[Amount]),
    'Date'[Date]
)
\`\`\`

### Custom Visuals
- Synoptic Panel
- Drill Down Choropleth
- Text Filter
- Advanced Analytics

### Data Modeling
- Star schema design
- Relationship optimization
- Calculated columns vs measures
- Row-level security

### Advanced Techniques
- Bookmarks and buttons
- Drill-through pages
- Custom tooltips
- What-if parameters

## Best Practices

1. **Design**: Clean, intuitive layouts
2. **Performance**: Optimize queries
3. **Accessibility**: Color-blind friendly
4. **Mobile**: Responsive design
5. **Documentation**: Clear annotations

## Learning Path

1. Start with beginner projects
2. Master DAX fundamentals
3. Learn data modeling
4. Practice advanced features
5. Build portfolio projects

## Resources

- Power BI Desktop (free)
- Sample datasets
- Microsoft Learn
- Community forums
- YouTube tutorials

## Conclusion

These 18 projects cover the full spectrum of Power BI capabilities. Start with projects aligned to your interests, and gradually tackle more complex scenarios. Build a portfolio that showcases your skills to potential employers!

Happy dashboard building! 📊
		`,
		author: "Nitika Sharma",
		category: "Data Science",
		tags: ["Power BI", "Data Visualization", "Analytics", "Projects"],
		thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
		readTime: "15 min read",
		featured: false,
		views: 0,
		likes: 0,
		createdAt: new Date("2026-01-02"),
	},
	{
		title: "Top 10 Machine Learning Algorithms in 2026",
		slug: "top-10-machine-learning-algorithms-2026",
		excerpt: "Learn about 10 machine learning algorithms that are transforming data analysis and shaping the future of computing. Read Now!",
		content: `
# Top 10 Machine Learning Algorithms in 2026

Machine learning algorithms are the backbone of modern AI systems. Here are the top 10 you need to know.

## 1. Linear Regression
The foundation of predictive modeling.

## 2. Logistic Regression
Perfect for classification problems.

## 3. Decision Trees
Intuitive and interpretable models.

## 4. Random Forests
Ensemble learning at its best.

## 5. Support Vector Machines
Powerful for complex decision boundaries.

## 6. Neural Networks
The foundation of deep learning.

## 7. K-Nearest Neighbors
Simple yet effective for many tasks.

## 8. Gradient Boosting
XGBoost, LightGBM, and CatBoost dominance.

## 9. Naive Bayes
Fast and efficient for text classification.

## 10. K-Means Clustering
Essential for unsupervised learning.

Master these algorithms and you'll be equipped for any ML challenge!
		`,
		author: "Sunil Ray",
		category: "Machine Learning",
		tags: ["Machine Learning", "Algorithms", "Data Science", "AI"],
		thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
		readTime: "10 min read",
		featured: false,
		views: 0,
		likes: 0,
		createdAt: new Date("2025-12-26"),
	},
];

async function seedBlogs() {
	try {
		await mongoose.connect(process.env.MONGODB_URI);
		console.log("MongoDB connected...");

		// Clear existing blogs
		await Blog.deleteMany({});
		console.log("Existing blogs cleared");

		// Insert new blogs
		const result = await Blog.insertMany(blogs);
		console.log(`${result.length} blogs added successfully!`);

		process.exit(0);
	} catch (error) {
		console.error("Error seeding blogs:", error);
		process.exit(1);
	}
}

seedBlogs();
