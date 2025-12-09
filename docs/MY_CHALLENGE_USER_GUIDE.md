# My Challenge - Quick Start & User Guide

## 🎯 What is My Challenge?

A dedicated tab for users to manage their training plans and track daily fitness challenges with AI-powered workout analysis. Unlike the general Challenges section, My Challenge is personal and focuses on a user's assigned training plans.

## 📍 How to Access

1. **From Navbar:** Click "My Challenge" in the main navigation menu
2. **Route:** `/my-challenge`
3. **Requirement:** Must be logged in

## 🏠 Landing Page - My Challenge

When you first visit My Challenge, you see:

```
┌─ My Challenge ─────────────────────────────────┐
│ Welcome back, [User Name]                       │
│ Track your training plans and complete daily   │
│ challenges with AI-powered feedback.            │
├─────────────────────────────────────────────────┤
│ ┌─ Active Plans ────────┐                      │
│ │ 3                     │                      │
│ └───────────────────────┘                      │
│ ┌─ Challenges Completed ┐                      │
│ │ 12                    │                      │
│ └───────────────────────┘                      │
│ ┌─ Current Streak ──────┐                      │
│ │ 15 days               │                      │
│ └───────────────────────┘                      │
├─ Your Training Plans ──────────────────────────┤
│ ┌─ 30-Day Push-up Master ────────────────────┐ │
│ │ Build strength and endurance with...       │ │
│ │ Intermediate | 30 days                     │ │
│ │ 12 / 30 days completed                     │ │
│ │ ████████░░░░░░░░░░░░ 40%                  │ │
│ └────────────────────────────────────────────┘ │
│ ┌─ AI Running Speed Program ─────────────────┐ │
│ │ ... (similar format)                       │ │
│ └────────────────────────────────────────────┘ │
│ ┌─ Core Strength Foundation ─────────────────┐ │
│ │ ... (similar format)                       │ │
│ └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

## 📋 Training Plan Detail Page

After selecting a plan, you see:

```
┌─ Back ────────────────────────────────────────┐
│                                               │
│ ┌─ 30-Day Push-up Master ────────────────────┐│
│ │ Build strength...          Intermediate   ││
│ │ ┌─ [Avatar] ┐                            ││
│ │ │           │ Assigned to: [User Name]   ││
│ │ └───────────┘                            ││
│ │ Progress: 40%                            ││
│ │ ████████░░░░░░░░░░░░ 12/30 days         ││
│ └────────────────────────────────────────────┘│
│                                               │
│ ┌─ Day Tabs ─────────────────────────────────┐│
│ │ [Day 1] [Day 2] [Day 3] [Day 4] ...       ││
│ └────────────────────────────────────────────┘│
│                                               │
│ ┌─ Day 1 - Monday ───────────────────────────┐│
│ │ ┌─ Basic Push-ups ────────────────────────┐││
│ │ │ Standard push-ups with proper form      │││
│ │ │                                         │││
│ │ │ Sets: 3  | Reps: 10  | ✓ Completed    │││
│ │ │                                         │││
│ │ │ Accuracy: 95% | Correct Reps: 30/30   │││
│ │ │ Posture: Correct                        │││
│ │ │                                         │││
│ │ │ 💡 Excellent form! Keep your back...  │││
│ │ │                                         │││
│ │ │ [Start Challenge] [Re-upload Video]    │││
│ │ └─────────────────────────────────────────┘││
│ │ ┌─ Diamond Push-ups ──────────────────────┐││
│ │ │ ... (similar format)                    │││
│ │ └─────────────────────────────────────────┘││
│ └────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘
```

## 💪 Challenge Card Display

Each challenge shows:

- **Name:** Exercise name
- **Sets:** Number of sets required
- **Reps:** Reps per set
- **Status:** 
  - ✓ Completed (Green)
  - ⏳ In Progress (Blue)
  - ⚠ Incorrect Form (Red)
  - Not Started (Gray)
- **AI Feedback:** (if completed)
  - Accuracy percentage
  - Correct reps count
  - Posture assessment
  - Form feedback

## 📹 Challenge Detail Modal

Click "Start Challenge" or "Upload Video" to open:

```
┌─ [Challenge Name] ───────────────── × ─────────┐
│                                                 │
│ ┌─ Sets: 3 ─────┐  ┌─ Reps per Set: 10 ──────┐ │
│ │ 3             │  │ 10                       │ │
│ └───────────────┘  └──────────────────────────┘ │
│                                                 │
│ Description:                                    │
│ Standard push-ups with proper form              │
│                                                 │
│ ┌─ AI Analysis Results ──────────────────────┐  │
│ │ Accuracy: 95%                              │  │
│ │ Correct Reps: 30/30                        │  │
│ │ Posture: Good                              │  │
│ │ Feedback: Keep your back straight...       │  │
│ └────────────────────────────────────────────┘  │
│                                                 │
│ Upload Video for AI Analysis                    │
│ ┌─────────────────────────────────────────────┐ │
│ │  📹 Select a video or drag and drop         │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│         [Upload & Analyze]                      │
└─────────────────────────────────────────────────┘
```

## ✨ Key Features

### 1. **Progress Tracking**
- Overall plan progress bar
- Days completed counter
- Individual challenge status
- Last activity date

### 2. **Day-Based Organization**
- Challenges grouped by day
- Easy navigation with day tabs
- Week structure or continuous days

### 3. **AI Analysis**
Upload video and get:
- ✓ Rep counting
- ✓ Form analysis
- ✓ Accuracy scoring
- ✓ Personalized feedback
- ✓ Form correction suggestions

### 4. **Challenge Status**
- **Not Started:** Default state
- **In Progress:** Started but not completed
- **Completed:** Successfully finished
- **Incorrect Form:** Needs form correction

## 🎬 How to Submit a Challenge

1. Click a challenge card
2. Click "Start Challenge" or "Upload Video"
3. Modal opens with challenge details
4. Select a video file (MP4, MOV, etc.)
5. Click "Upload & Analyze"
6. Wait for AI processing (2-3 seconds)
7. See AI analysis results
8. Challenge status updates to "Completed"

## 📊 AI Analysis Results

When AI analyzes your video:

```
Accuracy: 95%
- Shows how well you performed the exercise

Correct Reps: 30/30
- Number of correctly performed reps vs total

Posture: Good/Excellent/Needs Improvement
- Overall form assessment

Feedback: "Keep your back straight and core engaged"
- Specific tips for improvement

Suggestions:
- Focus on full range of motion
- Engage your core throughout
- Maintain steady breathing
```

## 🔄 Workflow Example

### Day 1 - Morning
```
1. Open My Challenge
2. Select "30-Day Push-up Master"
3. See Day 1 challenges
4. Click "Basic Push-ups"
5. Record a video
6. Upload video
7. Get AI feedback
8. Challenge marked as completed
```

### Day 2 - Next Day
```
1. Select same plan
2. Day 1 shows ✓ Completed
3. Click Day 2 tab
4. New challenges appear
5. Repeat workflow
```

## 💡 Tips for Best Results

1. **Good Lighting:** Ensure you're well-lit
2. **Full Body Visible:** Show complete movement range
3. **Clear Video:** Steady phone/camera position
4. **Proper Form:** Follow exercise description
5. **Good Audio:** Clear sound if instructions are audio

## 🎯 Status Indicators

| Status | Color | Icon | Meaning |
|--------|-------|------|---------|
| Completed | 🟢 Green | ✓ | Challenge finished successfully |
| In Progress | 🔵 Blue | ⏳ | Currently working on challenge |
| Not Started | ⚫ Gray | • | Not yet attempted |
| Incorrect Form | 🔴 Red | ⚠ | Form needs correction |

## 📱 Mobile Experience

The My Challenge feature is fully responsive:
- Single column layout on mobile
- Touch-friendly buttons
- Easy horizontal scrolling for day tabs
- Full-screen modal on mobile devices

## 🔐 Data Security

- User data is private
- Videos are analyzed but not stored
- Progress saved to user account
- Secure API communication

## ❓ FAQ

**Q: Can I redo a completed challenge?**
A: Yes, click "Re-upload Video" to submit a new attempt

**Q: How long does AI analysis take?**
A: Typically 2-3 seconds per video

**Q: What video formats are supported?**
A: MP4, MOV, AVI, and other common video formats

**Q: Can I pause a training plan?**
A: This feature can be added based on needs

**Q: Is there a community feature?**
A: Yes, see Community section for social challenges

## 📞 Support

For issues or suggestions:
- Check the FAQ above
- Review the full implementation guide in `MY_CHALLENGE_GUIDE.md`
- Contact admin through Settings

---

**Last Updated:** December 4, 2025
**Feature Status:** ✅ Active & Production Ready
