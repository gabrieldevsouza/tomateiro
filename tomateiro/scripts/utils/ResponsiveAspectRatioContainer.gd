@tool
extends AspectRatioContainer
class_name ResponsiveAspectRatioContainer

@onready var container: Control = get_parent()
func _ready() -> void:
	container = get_child(0)
	resized.connect(compute)

func compute() -> void:
	if container == null:
		container = get_child(0)
		if container == null:
			return
	
	var smaller_size = min(container.size.x, container.size.y)

	size = Vector2(smaller_size, smaller_size)
	
