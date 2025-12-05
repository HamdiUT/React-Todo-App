import { useState, useEffect, useRef } from 'react'
import './App.css'
import ElectricBorder from './ElectricBorder'
import TargetCursor from './TargetCursor'

// Background Particles Component
function ParticleBackground() {
  const [particles] = useState(() => 
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 10 + Math.random() * 5,
    }))
  )

  return (
    <>
      {particles.map(particle => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: `${particle.left}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}
    </>
  )
}

// Main TodoList Component
function TodoList() {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('viceCityTodos')
    if (savedTasks) {
      try {
        return JSON.parse(savedTasks)
      } catch (e) {
        console.error('Failed to load tasks:', e)
        return []
      }
    }
    return []
  })
  const [input, setInput] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingText, setEditingText] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef(null)
  const soundsRef = useRef({})

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('viceCityTodos', JSON.stringify(tasks))
  }, [tasks])

  // Preload sound effects
  useEffect(() => {
    soundsRef.current = {
      delete: new Audio('/sfx/sfx00377.wav'),
      hover: new Audio('/sfx/sfx00372.wav'),
      click: new Audio('/sfx/sfx00374.wav'),
      error: new Audio('/sfx/sfx00378.wav')
    }
    
    Object.values(soundsRef.current).forEach(audio => {
      audio.volume = 0.5
      audio.load()
    })
  }, [])

  // Initialize background music
  useEffect(() => {
    const audioElement = new Audio('https://dn721907.ca.archive.org/0/items/george-benson-give-me-the-night_202405/04%20GIVE%20ME%20THE%20NIGHT.mp3')
    audioElement.loop = true
    audioElement.volume = 0.15
    audioRef.current = audioElement
    
    return () => {
      audioElement.pause()
    }
  }, [])

  const toggleMusic = () => {
    if (!audioRef.current) return
    
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().catch(err => console.log('Playback failed:', err))
      setIsPlaying(true)
    }
  }

  // Sound effects helper
  const playSound = (soundType) => {
    const sound = soundsRef.current[soundType]
    if (sound) {
      sound.currentTime = 0
      sound.play().catch(err => console.log('SFX play failed:', err))
    }
  }

  const deleteTask = (id) => {
    playSound('delete')
    setTasks(tasks.filter(task => task.id !== id))
  }

  const addTask = (e) => {
    e.preventDefault()
    if (input.trim() === '') {
      playSound('error')
      return
    }

    playSound('click')
    const newTask = {
      id: Date.now(),
      text: input.trim(),
      completed: false,
    }

    setTasks([newTask, ...tasks])
    setInput('')
  }

  const toggleTask = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  const startEditing = (task) => {
    setEditingId(task.id)
    setEditingText(task.text)
  }

  const saveEdit = (id) => {
    if (editingText.trim() === '') return
    
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, text: editingText.trim() } : task
    ))
    setEditingId(null)
    setEditingText('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingText('')
  }

  const completedCount = tasks.filter(task => task.completed).length
  const totalCount = tasks.length

  return (
    <>
      <TargetCursor 
        spinDuration={2}
        hideDefaultCursor={true}
        parallaxOn={true}
      />
      <div className="app-container">
      {/* Audio Controller */}
      <button className="audio-controller cursor-target" onClick={toggleMusic} title={isPlaying ? 'Pause' : 'Play'}>
        {isPlaying ? '🔊' : '🔇'}
      </button>

      {/* Synthwave Background */}
      <div className="synthwave-bg">
        <div className="grid-background"></div>
        <div className="horizon-lines">
          <div className="horizon-line line-1"></div>
          <div className="horizon-line line-2"></div>
        </div>
        <ParticleBackground />
      </div>

      {/* Main Content */}
      <div className="content-wrapper">
        {/* Header */}
        <header className="header">
          <div className="header-images-stack">
            <img src="/img/gtap.png" alt="GTA police" className="header-police" />
            <img src="/img/vclogo.png" alt="GTA Logo" className="header-logo" />
          </div>
          <p className="header-subtitle">~ MISSION BOARD ~</p>
        </header>

        {/* Retro Separator */}
        <div className="retro-separator">
          <div className="separator-line"></div>
        </div>

        {/* Input Section */}
        <form onSubmit={addTask} className="input-section">
          <ElectricBorder
            color="#7df9ff"
            speed={0.6}
            chaos={0.5}
            thickness={2}
            style={{ borderRadius: 16 }}
          >
            <input
              type="text"
              className="todo-input"
              placeholder="Entrez votre mission..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength="150"
            />
          </ElectricBorder>
          <button 
            type="submit" 
            className="add-btn cursor-target"
            onMouseEnter={() => playSound('hover')}
          >
            Accepter
          </button>
        </form>

        {/* Task List */}
        {tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <img src="/img/tommyg.png" alt="Tommy Vercetti" className="empty-state-image" />
            </div>
            <p className="empty-state-text">
              Pas de missions en cours
            </p>
            <p style={{ fontSize: '0.9rem', marginTop: '10px', opacity: 0.6 }}>
              Miami vous attend...
            </p>
          </div>
        ) : (
          <>
            <ul className="todo-list">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className={`todo-item ${task.completed ? 'completed' : ''} ${editingId === task.id ? 'editing' : ''}`}
                >
                  {editingId === task.id ? (
                    // Edit Mode
                    <div className="todo-item-edit">
                      <input
                        type="text"
                        className="todo-edit-input"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            saveEdit(task.id)
                          }
                        }}
                        maxLength="80"
                        autoFocus
                      />
                      <div className="todo-edit-buttons">
                        <button
                          type="button"
                          className="edit-save-btn cursor-target"
                          onClick={() => saveEdit(task.id)}
                          onMouseEnter={() => playSound('hover')}
                          title="Enregistrer"
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          className="edit-cancel-btn cursor-target"
                          onClick={cancelEdit}
                          onMouseEnter={() => playSound('hover')}
                          title="Annuler"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <>
                      <label className="checkbox-wrapper">
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={task.completed}
                          onChange={() => toggleTask(task.id)}
                        />
                        <span className="todo-text">{task.text}</span>
                      </label>
                      <div className="todo-item-actions">
                        <button
                          type="button"
                          className="edit-btn cursor-target"
                          onClick={() => startEditing(task)}
                          onMouseEnter={() => playSound('hover')}
                          title="Modifier cette mission"
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          className="delete-btn cursor-target"
                          onClick={() => deleteTask(task.id)}
                          onMouseEnter={() => playSound('hover')}
                          title="Supprimer cette mission"
                        >
                          ✕
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>

            {/* Stats Section */}
            <div className="stats-section">
              <div className="stat">
                <div className="stat-value">{totalCount}</div>
                <div className="stat-label">Missions</div>
              </div>
              <div className="stat">
                <div className="stat-value">{completedCount}</div>
                <div className="stat-label">Complétées</div>
              </div>
              <div className="stat">
                <div className="stat-value">
                  {totalCount - completedCount}
                </div>
                <div className="stat-label">En Attente</div>
              </div>
            </div>
          </>
        )}
      </div>
      {/* Map icon*/}
      <div className="map">
        <div className="map-icon map-icon-north">N</div>
        <div className="map-icon map-icon-mission">D</div>
      </div>
    </div>
    </>
  )
}

export default TodoList
