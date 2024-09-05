extends Node
class_name PomodoroPlayer

@export var pomodoro_controller : PomodoroController

@export var pomodoro_timer_label : Label

@export var play_btn : BaseButton
@export var pause_btn : BaseButton
@export var repeat_btn : BaseButton


func _ready() -> void:
	play_btn.pressed.connect(on_btn_play_pressed)
	pause_btn.pressed.connect(on_btn_pause_pressed)
	repeat_btn.pressed.connect(on_btn_repeat_pressed)

	pomodoro_controller.tick_signal.connect(on_tick)
	pomodoro_controller.repeat_signal.connect(on_repeat)
	pomodoro_controller.prepare_signal.connect(on_prepare)
	
	pause_btn.visible = false
	play_btn.visible = true

func on_btn_play_pressed() -> void:
	play_btn.visible = false
	pause_btn.visible = true
	pomodoro_controller.play()

func on_btn_pause_pressed() -> void:
	pause_btn.visible = false
	play_btn.visible = true
	pomodoro_controller.pause()

func on_btn_repeat_pressed() -> void:
	pomodoro_controller.repeat()
	pause_btn.visible = false
	play_btn.visible = true

func on_prepare() -> void:
	print ("Prepare")
	pomodoro_timer_label.set_text(formart_time(pomodoro_controller.remaining_seconds.value))

func on_tick() -> void:
	pomodoro_timer_label.set_text(formart_time(pomodoro_controller.remaining_seconds.value))

func formart_time(time : float) -> String:
	var minutes = int(time / 60)
	var seconds = int(time) % 60 

	var formatted_time = str(minutes).pad_zeros(2) + ":" + str(seconds).pad_zeros(2)
	return formatted_time

func on_repeat() -> void:
	pomodoro_timer_label.set_text(formart_time(pomodoro_controller.remaining_seconds.value))
