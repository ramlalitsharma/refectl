# 🚀 Live Class Quick Start Guide

Quick reference for using all the new live class features.

---

## 📋 For Instructors

### Schedule a Class

1. Go to `/admin/live-classes/schedule`
2. Fill in:
   - Class name
   - Start/end time
   - Course link (optional)
   - Max participants
   - Enable features (recording, chat, etc.)
3. Click "Schedule Class"

### During Class

1. **Join the class** at scheduled time
2. **Click "Show Tools"** to open instructor panel
3. **Manage participants:**
   - View all participants
   - Mute/unmute users
   - Remove participants
4. **Manage Q&A:**
   - View question queue
   - Acknowledge questions
   - Resolve questions
5. **Create polls:**
   - Create single/multiple choice polls
   - View real-time results
   - Close polls when done
6. **Add resources:**
   - Use API or admin panel
   - Resources appear in student sidebar

### After Class

1. **View recordings:**
   - Go to `/live/recordings`
   - All recordings are saved automatically
2. **View analytics:**
   - Check attendance
   - View engagement metrics
   - Export reports

---

## 📚 For Students

### Join a Class

1. Go to `/live` to see available classes
2. Click "Join Classroom" on any active class
3. Allow camera/microphone permissions

### During Class

1. **Take Notes:**
   - Click "Show Tools" → "Notes" tab
   - Type your notes
   - Click "Save Note"
   - Notes are timestamped

2. **Ask Questions:**
   - Click "Q&A" tab
   - Type your question (optional)
   - Click "✋ Raise Hand"
   - Wait for instructor to call on you

3. **Participate in Polls:**
   - Click "Polls" tab
   - Vote on active polls
   - See results in real-time

4. **Access Resources:**
   - Click "Resources" tab
   - View all class materials
   - Download or open resources

5. **Check Connection:**
   - Connection quality shown in header
   - Green = Good, Yellow = Medium, Red = Poor

---

## 🔗 API Quick Reference

### Schedule Class
```javascript
POST /api/live/schedule
{
  "roomName": "Python Basics",
  "scheduledStartTime": "2024-01-20T10:00:00Z",
  "scheduledEndTime": "2024-01-20T11:00:00Z",
  "maxParticipants": 50,
  "enableRecording": true
}
```

### Save Note
```javascript
POST /api/live/student/notes
{
  "roomId": "python-basics-123",
  "content": "Important point about loops"
}
```

### Raise Hand
```javascript
POST /api/live/qna
{
  "action": "raise",
  "roomId": "python-basics-123",
  "question": "Can you explain closures?"
}
```

### Create Poll
```javascript
POST /api/live/student/polls
{
  "action": "create",
  "roomId": "python-basics-123",
  "question": "Do you understand loops?",
  "options": ["Yes", "No", "Somewhat"],
  "type": "single"
}
```

### Get Participants
```javascript
GET /api/live/participants?roomId=python-basics-123
```

### Get Analytics
```javascript
GET /api/live/analytics?roomId=python-basics-123
```

---

## 🎯 Feature Matrix

| Feature | Student | Instructor | Admin |
|---------|---------|------------|-------|
| Join Class | ✅ | ✅ | ✅ |
| Take Notes | ✅ | ✅ | ✅ |
| Raise Hand | ✅ | - | - |
| Vote on Polls | ✅ | ✅ | ✅ |
| View Resources | ✅ | ✅ | ✅ |
| Manage Participants | - | ✅ | ✅ |
| Create Polls | - | ✅ | ✅ |
| Manage Q&A | - | ✅ | ✅ |
| Schedule Classes | - | ✅ | ✅ |
| View Recordings | ✅* | ✅ | ✅ |
| View Analytics | - | ✅ | ✅ |

*Students can view recordings for classes they're enrolled in

---

## 📱 Pages

- `/live` - Browse live classes
- `/live/[roomId]` - Join specific class
- `/live/recordings` - View recordings
- `/admin/live-classes` - Manage classes
- `/admin/live-classes/schedule` - Schedule new class

---

## 🔧 Configuration

All settings are saved in the database and applied automatically:
- Recording enabled/disabled
- Screen sharing enabled/disabled
- Chat enabled/disabled
- Whiteboard enabled/disabled
- Max participants
- Scheduled times

---

**Everything is ready to use!** 🎉

