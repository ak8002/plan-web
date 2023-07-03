import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {
  Checkbox,
  Input,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  TextField
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

export default function App() {
  const [dateState, setDateState] = React.useState(dayjs());
  const [planState, setPlanState] = React.useState(null)
  const [loading, setLoading] = React.useState(true);

  const handleDateChange = (date) => {
    setDateState(date);
  };

  React.useEffect(() => {
    fetch(`${base}/api/plans/${dateState.format('YYYY-MM-DD')}`)
      .then(res => res.json())
      .then(plan => {
        setPlanState(plan);
        setLoading(false);
      })
  }, [dateState])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Plan plan={planState} date={dateState} onDateChange={handleDateChange} />
    </LocalizationProvider>
  );
}

function Plan({ plan, date, onDateChange }) {
  const { topTasks, otherTasks, notes } = plan;
  const [dateState, setDateState] = React.useState(date);
  const [topTasksState, setTopTasksState] = React.useState(topTasks);
  const [otherTasksState, setOtherTasksState] = React.useState(otherTasks);
  const [notesState, setNotesState] = React.useState(notes);

  React.useEffect(() => {
    setDateState(date);
    setTopTasksState(plan.topTasks);
    setOtherTasksState(plan.otherTasks);
    setNotesState(plan.notes);
  }, [plan, date])

  // The ordering between the two focus matters because the last focus overrides the first.
  // 1. focus on newly created other task
  React.useEffect(() => {
    const newTask = otherTasksState.find(task => task.name === '');
    if (newTask) {
      document.getElementById('input_' + newTask.id).focus();
    }
  }, [otherTasksState])

  // 2. focus on newly created new task
  React.useEffect(() => {
    const newTask = topTasksState.find(task => task.name === '');
    if (newTask) {
      document.getElementById('input_' + newTask.id).focus();
    }
  }, [topTasksState])

  React.useEffect(() => {
    onDateChange(dateState);
  }, [dateState])

  const handleTopTaskToggle = (id) => {
    const newTopTasks = topTasksState.map(task => {
      if (task.id === id) {
        return { ...task, completed: !task.completed }
      }
      return task;
    });
    setTopTasksState(newTopTasks);
    debounceSend(`/api/plans/${dateState.format('YYYY-MM-DD')}/top-tasks`, newTopTasks, 200)
  }

  const handleTopTaskNameChange = (name, id) => {
    const newTopTasks = topTasksState.map(task => {
      if (task.id === id) {
        return { ...task, name }
      }
      return task;
    });
    setTopTasksState(newTopTasks);
    debounceSend(`/api/plans/${dateState.format('YYYY-MM-DD')}/top-tasks`, newTopTasks, 700)
  }

  // adds a new task to the top tasks
  const handleTopTaskReturn = (id) => {
    const curentTask = topTasksState.find(task => task.id === id);
    if (curentTask.name === '') {
      if (topTasksState.length === 1) {
        return;
      }
      // delete this task
      const newTopTasks = topTasksState.filter(task => task.id !== id);
      setTopTasksState(newTopTasks);
      debounceSend(`/api/plans/${dateState.format('YYYY-MM-DD')}/top-tasks`, newTopTasks, 200)
      return;
    }

    const newTopTasks = [...topTasksState]
    const index = newTopTasks.findIndex(task => task.id === id);
    newTopTasks.splice(index + 1, 0, {
      id: uuidv4(),
      name: '',
      duration: 0,
      completed: false
    });
    setTopTasksState(newTopTasks);
    debounceSend(`/api/plans/${dateState.format('YYYY-MM-DD')}/top-tasks`, newTopTasks, 200)
  }


  const handleOtherTaskToggle = (id) => {
    const newOtherTasks = otherTasksState.map(task => {
      if (task.id === id) {
        return { ...task, completed: !task.completed }
      }
      return task;
    });
    setOtherTasksState(newOtherTasks);
    debounceSend(`/api/plans/${dateState.format('YYYY-MM-DD')}/other-tasks`, newOtherTasks, 200)
  }

  const handleOtherTaskNameChange = (name, id) => {
    const newOtherTasks = otherTasksState.map(task => {
      if (task.id === id) {
        return { ...task, name }
      }
      return task;
    });
    setOtherTasksState(newOtherTasks);
    debounceSend(`/api/plans/${dateState.format('YYYY-MM-DD')}/other-tasks`, newOtherTasks, 700)
  }

  const handleOtherTaskReturn = (id) => {
    const curentTask = otherTasksState.find(task => task.id === id);
    if (curentTask.name === '') {
      if (otherTasksState.length === 1) {
        return;
      }
      // delete this task
      const newOtherTasks = otherTasksState.filter(task => task.id !== id);
      setOtherTasksState(newOtherTasks);
      debounceSend(`/api/plans/${dateState.format('YYYY-MM-DD')}/other-tasks`, newOtherTasks, 200)
      return;
    }

    const newOtherTasks = [...otherTasksState]
    const index = newOtherTasks.findIndex(task => task.id === id);
    newOtherTasks.splice(index + 1, 0, {
      id: uuidv4(),
      name: '',
      duration: 0,
      completed: false
    });
    setOtherTasksState(newOtherTasks);
    debounceSend(`/api/plans/${dateState.format('YYYY-MM-DD')}/other-tasks`, newOtherTasks, 200)
  }

  const handleNotesChange = (newNotes) => {
    setNotesState(newNotes);
    debounceSend(`/api/plans/${dateState.format('YYYY-MM-DD')}/notes`, newNotes, 1000)
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        WEEKS IN QUARTER: {weeksLeftInQuarter(dateState)}
        <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ mr: 2 }}>
            {getDayOfWeek(dateState)}
          </Typography>
          <DatePicker value={dateState} onChange={setDateState} slotProps={{ textField: { variant: 'standard', } }} />
        </Box>
        <Typography variant="h6" component="h2" gutterBottom>
          Top Tasks
        </Typography>
        <List>
          {topTasksState.map(task => (
            <ListItem key={`topTask-${task.id}`} disablePadding divider>
              <ListItemButton sx={{ pl: 0 }}>
                <ListItemIcon onClick={() => handleTopTaskToggle(task.id)}>
                  <Checkbox
                    edge="end"
                    checked={task.completed}
                    disableRipple
                    inputProps={{ 'aria-labelledby': task.id }}
                  />
                </ListItemIcon>
                <Input id={'input_' + task.id}
                  value={task.name} onChange={(e) => handleTopTaskNameChange(e.target.value, task.id)}
                  onKeyUp={(e) => { if (e.key === 'Enter') { handleTopTaskReturn(task.id) } }}
                  inputProps={{ 'aria-labelledby': task.id }} disableUnderline fullWidth />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Typography variant="h6" component="h2" gutterBottom>
          Other Tasks
        </Typography>
        <List>
          {otherTasksState.map(task => (
            <ListItem key={`otherTask-${task.id}`} disablePadding divider>
              <ListItemButton sx={{ pl: 0 }}>
                <ListItemIcon onClick={() => handleOtherTaskToggle(task.id)}>
                  <Checkbox
                    edge="end"
                    checked={task.completed}
                    disableRipple
                    inputProps={{ 'aria-labelledby': task.id }}
                  />
                </ListItemIcon>
                <Input id={'input_' + task.id}
                  value={task.name} onChange={(e) => handleOtherTaskNameChange(e.target.value, task.id)}
                  onKeyUp={(e) => { if (e.key === 'Enter') { handleOtherTaskReturn(task.id) } }}
                  inputProps={{ 'aria-labelledby': task.id }} disableUnderline fullWidth />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Typography variant="h6" component="h2" gutterBottom>
          Notes
        </Typography>
        <TextField id={'notes_' + dateState} multiline rows={4} fullWidth variant="filled"
          value={notesState} onChange={(e) => handleNotesChange(e.target.value)} />
      </Box>
    </Container>
  );
}


function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0,
      v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}


// returns day of the week for a date
function getDayOfWeek(date) {
  const dayOfWeek = new Date(date).getDay();
  return isNaN(dayOfWeek) ? null :
    ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][dayOfWeek];
}

// Converts a date to a string by using the current or specified locale.
function localeDate(date) {
  return new Date(date).toLocaleDateString();
}

// returns weeks left in quarter
function weeksLeftInQuarter(date) {
  const d = new Date(date);
  const quarterEnd = new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3 + 3, 0);
  const diff = quarterEnd - d + (d.getTimezoneOffset() - quarterEnd.getTimezoneOffset()) * 60 * 1000;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay / 7);
}

const base = 'https://u1kkares22.execute-api.us-east-1.amazonaws.com';
function debounceSend(url, data, timeout) {
  debounce(url, () => {
    fetch(`${base}${url}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Something went wrong');
    })
      .catch((error) => {
        console.log(error)
      });
  }, timeout)
}


// debounce function to only make the last function call with the same args
const debounceMap = new Map();
function debounce(key, func, timeout) {
  if (debounceMap.has(key)) {
    clearTimeout(debounceMap.get(key));
  }
  debounceMap.set(key, setTimeout(() => {
    func();
    debounceMap.delete(key);
  }, timeout));
}

